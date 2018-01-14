#include <stdio.h>
#include <unistd.h>

int main()
{
	puts("yeah1");
	close(1);
	puts("yeah2");
	close(1);
	return 0;
}
