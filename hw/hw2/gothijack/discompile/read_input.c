signed __int64 __fastcall read_input(void *a1, unsigned int a2)
{
  signed __int64 result; // rax@4
  int v3; // [sp+1Ch] [bp-4h]@1

  v3 = read(0, a1, a2);
  if ( v3 <= 0 )
  {
    puts("read error");
    _exit(1);
  }
  result = *((_BYTE *)a1 + v3 - 1);
  if ( (_BYTE)result == 10 )
  {
    result = (signed __int64)((char *)a1 + v3 - 1);
    *(_BYTE *)result = 0;
  }
  return result;
}