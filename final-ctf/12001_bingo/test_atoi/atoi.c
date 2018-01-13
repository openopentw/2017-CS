#include <stdio.h>
#include <stdlib.h>

int main()
{
	char a[] = "aapp";
	printf("%d\n", atoi(a));
	char b[] = "101\xc0";
	printf("%d\n", atoi(b));
	char c[] = "1\xffj\"";
	printf("%d\n", atoi(c));
	return 0;
}
