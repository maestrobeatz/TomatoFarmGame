import {ReceiveOptions} from '@greymass/buoy'
import {AES_CBC} from '@greymass/miniaes'
import {
    Bytes,
    CallbackPayload,
    CallbackType,
    ChainDefinition,
    ChainId,
    Checksum256,
    Checksum512,
    LoginContext,
    PrivateKey,
    PublicKey,
    Serializer,
    Signature,
    SigningRequest,
    UInt64,
} from '@wharfkit/session'

import {generateReturnUrl, uuid} from './utils'

import {BuoySession} from './buoy-types'

import {SealedMessage} from './anchor-types'

import WebSocket from 'isomorphic-ws'

export interface WalletPluginOptions {
    buoyUrl?: string
    buoyWs?: WebSocket
}

export interface IdentityRequestResponse {
    callback
    request: SigningRequest // Request for multi-device login
    sameDeviceRequest: SigningRequest // Request for same-device login
    requestKey: PublicKey
    privateKey: PrivateKey
}

/**
 * createIdentityRequest
 *
 * @param context LoginContext
 * @returns
 */
export async function createIdentityRequest(
    context: LoginContext,
    buoyUrl: string
): Promise<IdentityRequestResponse> {
    // Create a new private key and public key to act as the request key
    const privateKey = PrivateKey.generate('K1')
    const requestKey = privateKey.toPublic()

    // Create a new BuoySession struct to be used as the info field
    const createInfo = BuoySession.from({
        session_name: context.appName,
        request_key: requestKey,
        user_agent: getUserAgent(),
    })

    // Determine based on the options whether this is a multichain request
    const isMultiChain = !(context.chain || context.chains.length === 1)

    // Create the callback
    const callbackChannel = prepareCallbackChannel(buoyUrl)

    // Determine the chain id(s) to use
    const chainId: ChainId | null = isMultiChain
        ? null
        : context.chain
        ? ChainId.from(context.chain.id.array)
        : null

    const chainIds: ChainId[] = isMultiChain
        ? context.chains.map((c) => ChainId.from(c.id.array))
        : []

    // Create the request
    const request = SigningRequest.identity(
        {
            callback: prepareCallback(callbackChannel),
            scope: String(context.appName),
            chainId,
            chainIds,
            info: {
                link: createInfo,
                scope: String(context.appName),
            },
        },
        context.esrOptions
    )

    const sameDeviceRequest = request.clone()
    if (typeof window !== 'undefined') {
        const returnUrl = generateReturnUrl()
        sameDeviceRequest.setInfoKey('same_device', true)
        sameDeviceRequest.setInfoKey('return_path', returnUrl)
    }

    // Return the request and the callback data
    return {
        callback: callbackChannel,
        request,
        sameDeviceRequest,
        requestKey,
        privateKey,
    }
}

/**
 * prepareTransactionRequest
 *
 * @param resolved ResolvedSigningRequest
 * @returns
 */

export function setTransactionCallback(request: SigningRequest, buoyUrl) {
    const callback = prepareCallbackChannel(buoyUrl)

    request.setCallback(`${callback.service}/${callback.channel}`, true)

    return callback
}

export function getUserAgent(): string {
    const version = '__ver'
    let agent = `@wharfkit/protocol-esr ${version}`
    if (typeof navigator !== 'undefined') {
        agent += ' ' + navigator.userAgent
    }
    return agent
}

export function prepareCallback(callbackChannel: ReceiveOptions): CallbackType {
    const {service, channel} = callbackChannel
    return {
        url: `${service}/${channel}`,
        background: true,
    }
}

function prepareCallbackChannel(buoyUrl): ReceiveOptions {
    return {
        service: buoyUrl,
        channel: uuid(),
    }
}

export function sealMessage(
    message: string,
    privateKey: PrivateKey,
    publicKey: PublicKey,
    nonce?: UInt64
): SealedMessage {
    const secret = privateKey.sharedSecret(publicKey)
    if (!nonce) {
        nonce = UInt64.random()
    }
    const key = Checksum512.hash(Serializer.encode({object: nonce}).appending(secret.array))
    const cbc = new AES_CBC(key.array.slice(0, 32), key.array.slice(32, 48))
    const ciphertext = Bytes.from(cbc.encrypt(Bytes.from(message, 'utf8').array))
    const checksumView = new DataView(Checksum256.hash(key.array).array.buffer)
    const checksum = checksumView.getUint32(0, true)
    return SealedMessage.from({
        from: privateKey.toPublic(),
        nonce,
        ciphertext,
        checksum,
    })
}

export async function verifyLoginCallbackResponse(callbackResponse, context: LoginContext) {
    if (!callbackResponse.sig || callbackResponse.sig.length === 0) {
        throw new Error('Invalid response, must have at least one signature')
    }

    let chain: ChainDefinition
    if (!context.chain && context.chains.length > 1) {
        if (!callbackResponse.cid) {
            throw new Error('Multi chain response payload must specify resolved chain id (cid)')
        }
    } else {
        chain = context.chain || context.chains[0]

        if (callbackResponse.cid && String(chain.id) !== callbackResponse.cid) {
            throw new Error('Got response for wrong chain id')
        }
    }
}

export function extractSignaturesFromCallback(payload: CallbackPayload): Signature[] {
    const signatures: string[] = []

    let index = 0
    let sig: string | undefined = payload.sig

    while (sig) {
        signatures.push(String(sig))

        sig = payload[`sig${index}`]

        index++
    }

    // Deduplicate and make signatures
    return [...new Set(signatures)].map((s) => Signature.from(s))
}

export function isCallback(object: any): object is CallbackPayload {
    return 'tx' in object
}
