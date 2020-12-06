declare module 'wakeonlan' {
    export default function send(mac: string, opts?: object): Promise<void>;
}