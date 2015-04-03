
def safe_cast(val, to_type, default=None):
    try:
        return to_type(val)
    except:
        return default


def byte_2_easy_read(bytesize):
    if bytesize > 1024*1024*1024:
        return str('%.1f' %(float(bytesize)/float(1024*1024*1024))) + 'G'
    elif bytesize > 1024*1024:
        return str('%.1f' %(float(bytesize)/float(1024*1024))) + 'M'
    elif bytesize > 1024:
        return str('%.1f' %(float(bytesize)/float(1024))) + 'KB'
    else:
        return str(bytesize) + "B"