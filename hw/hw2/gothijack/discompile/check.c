signed __int64 __fastcall check(const char *a1)
{
  int i; // [sp+1Ch] [bp-14h]@1

  for ( i = 0; i < strlen(a1); ++i )
  {
    if ( !isalnum(a1[i]) )
      return 0LL;
  }
  return 1LL;
}