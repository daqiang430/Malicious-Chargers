import sys
from struct import unpack
from StringIO import StringIO
from time import strftime, gmtime

def analysisCookie(FilePath):
    record = []
    if not FilePath:
        return record
    try:
        binary_file=open(FilePath,'rb')
    except IOError as e:
        print 'File Not Found :'+ FilePath
        return record

    file_header = binary_file.read(4) 
    if str(file_header)!='cook':
        print "Not a Cookies.binarycookie file"
        return record
    num_pages=unpack('>i',binary_file.read(4))[0]
    page_sizes = [] 
    for np in range(num_pages):
        page_sizes.append(unpack('>i', binary_file.read(4))[0])
    pages = []
    for ps in page_sizes:
        pages.append(binary_file.read(ps))
    for page in pages:
        page  = StringIO(page)
        page.read(4)
        num_cookies = unpack('<i',page.read(4))[0]  

        cookie_offsets = []
        for nc in range(num_cookies):
            cookie_offsets.append(unpack('<i',page.read(4))[0]) 
        page.read(4)

        cookie=''
        for offset in cookie_offsets:
            try:
                page.seek(offset)                                   #Move the page pointer to the cookie starting point
                cookiesize=unpack('<i',page.read(4))[0]             #fetch cookie size
                cookie=StringIO(page.read(cookiesize))              #read the complete cookie 
                
                cookie.read(4)                                      #unknown
                
                flags=unpack('<i',cookie.read(4))[0]                #Cookie flags:  1=secure, 4=httponly, 5=secure+httponly
                cookie_flags=''
                if flags==0:
                    cookie_flags=''
                elif flags==1:
                    cookie_flags='Secure'
                elif flags==4:
                    cookie_flags='HttpOnly'
                elif flags==5:
                    cookie_flags='Secure; HttpOnly'
                else:
                    cookie_flags='Unknown'
                    
                cookie.read(4)                                      #unknown
                
                urloffset=unpack('<i',cookie.read(4))[0]            #cookie domain offset from cookie starting point
                nameoffset=unpack('<i',cookie.read(4))[0]           #cookie name offset from cookie starting point
                pathoffset=unpack('<i',cookie.read(4))[0]           #cookie path offset from cookie starting point
                valueoffset=unpack('<i',cookie.read(4))[0]          #cookie value offset from cookie starting point
                
                endofcookie=cookie.read(8)                          #end of cookie
                                        
                expiry_date_epoch= unpack('<d',cookie.read(8))[0]+978307200          #Expiry date is in Mac epoch format: Starts from 1/Jan/2001
                expiry_date=strftime("%a, %d %b %Y ",gmtime(expiry_date_epoch))[:-1] #978307200 is unix epoch of  1/Jan/2001 //[:-1] strips the last space
                        
                create_date_epoch=unpack('<d',cookie.read(8))[0]+978307200           #Cookies creation time
                create_date=strftime("%a, %d %b %Y ",gmtime(create_date_epoch))[:-1]
                #print create_date
                
                cookie.seek(urloffset-4)                            #fetch domaain value from url offset
                url=''
                u=cookie.read(1)
                while unpack('<b',u)[0]!=0:
                    url=url+str(u)
                    u=cookie.read(1)
                        
                cookie.seek(nameoffset-4)                           #fetch cookie name from name offset
                name=''
                n=cookie.read(1)
                while unpack('<b',n)[0]!=0:
                    name=name+str(n)
                    n=cookie.read(1)
                        
                cookie.seek(pathoffset-4)                          #fetch cookie path from path offset
                path=''
                pa=cookie.read(1)
                while unpack('<b',pa)[0]!=0:
                    path=path+str(pa)
                    pa=cookie.read(1)
                        
                cookie.seek(valueoffset-4)                         #fetch cookie value from value offset
                value=''
                va=cookie.read(1)
                while unpack('<b',va)[0]!=0:
                    value=value+str(va)
                    va=cookie.read(1)
                record.append('Cookie : '+name+'='+value+'; domain='+url+'; path='+path+'; '+'expires='+expiry_date+'; '+cookie_flags)
            except Exception, e:
                print "Error: %s"%e
                continue
   
    binary_file.close()
    return record
if __name__ == '__main__':
    file = "/root/phoneinfos/F2LLJ699FP6H-iPhone5S/ifuse_root/Cookies.binarycookies"
    print analysisCookie(file)
