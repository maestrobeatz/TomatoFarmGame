import {ABI, ABIDef, API, APIClient, NameType} from '@wharfkit/antelope'
import {AbiProvider} from '@wharfkit/signing-request'

export interface ABICacheInterface extends AbiProvider {
    readonly cache: Map<string, ABI>
    readonly pending: Map<string, Promise<API.v1.GetRawAbiResponse>>
    getAbi(account: NameType): Promise<ABI>
    setAbi(account: NameType, abi: ABIDef, merge?: boolean): void
}

/**
 * Given an APIClient instance, this class provides an AbiProvider interface for retrieving and caching ABIs.
 */
export class ABICache implements ABICacheInterface {
    readonly cache: Map<string, ABI> = new Map()
    readonly pending: Map<string, Promise<API.v1.GetRawAbiResponse>> = new Map()

    constructor(readonly client: APIClient) {}

    async getAbi(account: NameType): Promise<ABI> {
        const key = String(account)
        let record = this.cache.get(key)
        if (!record) {
            let getAbi = this.pending.get(key)
            if (!getAbi) {
                getAbi = this.client.v1.chain.get_raw_abi(account)
                this.pending.set(key, getAbi)
            }
            const response = await getAbi
            this.pending.delete(key)
            if (response.abi) {
                record = ABI.from(response.abi)
                this.cache.set(key, record)
            } else {
                throw new Error(`ABI for ${key} could not be loaded.`)
            }
        }
        return record
    }

    setAbi(account: NameType, abiDef: ABIDef, merge = false) {
        const key = String(account)
        const abi = ABI.from(abiDef)
        const existing = this.cache.get(key)
        if (merge && existing) {
            this.cache.set(
                key,
                ABI.from({
                    action_results: mergeAndDeduplicate(
                        existing.action_results,
                        abi.action_results
                    ),
                    types: mergeAndDeduplicate(existing.types, abi.types, 'new_type_name'),
                    structs: mergeAndDeduplicate(existing.structs, abi.structs),
                    actions: mergeAndDeduplicate(existing.actions, abi.actions),
                    tables: mergeAndDeduplicate(existing.tables, abi.tables),
                    ricardian_clauses: mergeAndDeduplicate(
                        existing.ricardian_clauses,
                        abi.ricardian_clauses,
                        'id'
                    ),
                    variants: mergeAndDeduplicate(existing.variants, abi.variants),
                    version: abi.version,
                })
            )
        } else {
            this.cache.set(key, abi)
        }
    }
}

function mergeAndDeduplicate(array1, array2, byField = 'name') {
    return array2.reduce((acc: any[], current: any) => {
        if (!acc.some((obj: any) => String(obj[byField]) === String(current[byField]))) {
            acc.push(current)
        }
        return acc
    }, array1.slice())
}
