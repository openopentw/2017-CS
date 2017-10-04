int main()
{
	int a = 0x0;
	while(a <= 0x63)
		if(a == 0x14)
			return 0;
		else
			a += 0x1;
	return 0;
}
