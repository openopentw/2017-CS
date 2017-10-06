int __cdecl encrypt(int scanf_string, int write_amount)
{
  int iter; // ebx@1
  FILE *file_flag; // edi@1
  int v4; // edx@2
  int v5; // eax@2
  int ptr; // [sp+14h] [bp-20h]@2

  iter = 0;
  file_flag = fopen("flag", "wb");
  if ( write_amount )
  {
    do
    {
      v4 = (iter + 1) << (iter + 2) % 10u;
      v5 = *(_BYTE *)(scanf_string + iter++);
      ptr = v4 * v5 + 9011;
      fwrite(&ptr, 4u, 1u, file_flag);
    }
    while ( iter != write_amount );
  }
  return fclose(file_flag);
}