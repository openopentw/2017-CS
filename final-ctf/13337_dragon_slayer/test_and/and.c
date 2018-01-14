#include <stdio.h>

void print_int(int *num_addr) {
	printf("%d\n", *(num_addr));
}

int main()
{
	int list[5] = {1, 2, 3, 4, 5};
	for(int i = 0; i < 5; ++i) {
		print_int(&list[i]);
	}
	return 0;
}
