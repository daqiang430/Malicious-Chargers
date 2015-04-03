import ConfigParser, hashlib
from constants import *

class FilePoint():
    section = "fileTopath"
    def __init__(self):
	self.section = "fileTopath"
	config = ConfigParser.RawConfigParser()
	config.add_section(self.section)
	with open(CONFIG_FILE_DIR, 'wb') as configfile:
            config.write(configfile)

    def set(self, abspath):
	if not abspath: return None
	key = hashlib.md5(abspath).hexdigest()
	config = ConfigParser.ConfigParser()
        config.read(CONFIG_FILE_DIR)
        if not config.has_section(self.section):
	    config.add_section(self.section)
        if config.has_option(self.section, key):
	    config.remove_option(self.section, key)
        config.set(self.section, key, abspath)
        with open(CONFIG_FILE_DIR, 'w') as configfile:
            config.write(configfile)
        return key

    def get(self, key):
    	if not key: return None
    	config = ConfigParser.ConfigParser()
        config.read(CONFIG_FILE_DIR)
        return config.get("%s"%self.section, key, "")


