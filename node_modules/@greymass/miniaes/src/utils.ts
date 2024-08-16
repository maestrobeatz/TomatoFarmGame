export function _heap_init(heap?: Uint8Array, heapSize?: number): Uint8Array {
    const size = heap ? heap.byteLength : heapSize || 65536

    if (size & 0xfff || size <= 0)
        throw new Error('heap size must be a positive integer and a multiple of 4096')

    heap = heap || new Uint8Array(new ArrayBuffer(size))

    return heap
}

export function _heap_write(
    heap: Uint8Array,
    hpos: number,
    data: Uint8Array,
    dpos: number,
    dlen: number
): number {
    const hlen = heap.length - hpos
    const wlen = hlen < dlen ? hlen : dlen

    heap.set(data.subarray(dpos, dpos + wlen), hpos)

    return wlen
}

export function is_buffer(a: ArrayBuffer): boolean {
    return a instanceof ArrayBuffer
}

export function is_bytes(a: Uint8Array): boolean {
    return a instanceof Uint8Array
}

export function joinBytes(...arg: Uint8Array[]): Uint8Array {
    const totalLength = arg.reduce((sum, curr) => sum + curr.length, 0)
    const ret = new Uint8Array(totalLength)

    let cursor = 0
    for (let i = 0; i < arg.length; i++) {
        ret.set(arg[i], cursor)
        cursor += arg[i].length
    }
    return ret
}
