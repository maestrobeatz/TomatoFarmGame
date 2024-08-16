import {receive} from '@greymass/buoy'
import {CallbackPayload} from '@wharfkit/session'

export async function waitForCallback(callbackArgs, buoyWs, t): Promise<CallbackPayload> {
    // Use the buoy-client to create a promise and wait for a response to the identity request
    const callbackResponse = await receive({...callbackArgs, WebSocket: buoyWs || WebSocket})

    if (!callbackResponse) {
        // If the promise was rejected, throw an error
        throw new Error(callbackResponse.rejected)
    }

    // If the promise was rejected, throw an error
    if (typeof callbackResponse.rejected === 'string') {
        throw new Error(callbackResponse.rejected)
    }

    // Process the identity request callback payload
    const payload = JSON.parse(callbackResponse) as CallbackPayload

    if (payload.sa === undefined || payload.sp === undefined || payload.cid === undefined) {
        throw new Error(t('error.cancelled', {default: 'The request was cancelled from Anchor.'}))
    }

    return payload
}
