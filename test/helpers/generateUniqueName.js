/* @flow */

let id: number = 1
export default function (): string {
  return `${process.pid}-${id++}`
}
