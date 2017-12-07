#include <stdio.h>

char *none_char;
void *none;
int main()
{
	printf("%lu\n", sizeof(char));
	printf("%lu\n", sizeof(none_char));
	printf("%lu\n", sizeof(none));
	return 0;
}
