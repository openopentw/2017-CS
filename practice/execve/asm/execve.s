section .data
    msg db      "/bin/sh"
	blank db	""

section .text
    global _start
_start:
    mov     rax, 0x3b
    mov     rdi, msg
    mov     rsi, blank
    mov     rdx, blank
    syscall
    mov    rax, 60
    mov    rdi, 0
    syscall
