#include <stdio.h>
#include <unistd.h>

int main()
{
	char buf[30];
	int ret_read;
	ret_read = read(0, buf, 8LL);
	puts(buf);
	return 0;
}
