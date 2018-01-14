#include <stdio.h>
#include <unistd.h>

int main()
{
	puts("yeah1");
	close(1);
	puts("yeah2");
	open(1, 0);
	puts("yeah2");
	return 0;
}
