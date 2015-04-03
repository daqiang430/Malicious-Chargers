#! /usr/bin/python
#-*- coding: utf-8 -*-

ROOT_NODE = "0"
NODE_INFO = "1"
NODE_PHOTO = "2"
NODE_VIDEO = "3"
NODE_DATA = "4"
NODE_SMS = "5"
NODE_ADDRESS = "6"
NODE_DATE = "7"
NODE_SETTING = "8"
NODE_LOG = "9"
NODE_NOTE = "10"
NODE_JAILBREAK = "11"
FIRST_NODE = {
    NODE_INFO : u"手机信息",
    NODE_SETTING : u"系统配置",
    NODE_PHOTO : u"隐私照片",
    NODE_VIDEO : u"隐私视频",
    NODE_DATA : u"隐私数据",
    NODE_SMS : u"隐私短信",
    NODE_ADDRESS : u"通讯录信息",
    NODE_DATE : u"日历文件",
    NODE_LOG : u"日志文件",
    NODE_NOTE : u"备忘录",
    NODE_JAILBREAK : u"越狱数据",
}

TYPE_FOLD = "0"
TYPE_IMG = "1"
TYPE_VIDEO = "2"
TYPE_PLISTFILE = "3"
TYPE_TEXTFILE = "4"
TYPE_DBFILE = "5"
TYPE_OTHER = "6"
TYPE_DEV = "7"
TYPE_JAILBREAK = "8"
TYPE_IMG_DICT = (".jpg",".JPG",".jpeg" ,".JPEG",".png", ".PNG", ".gif", ".GIF", ".thm", ".THM", ".BMP", ".bmp")
TYPE_VIDEO_DICT = (".MOV", ".mov", ".mp4", ".MP4",".3GP", ".AVC", ".AVI", "MPEG-4")
TYPE_TEXT_DICT = {".txt", ".json", ".log", ".js"}

NODE_DIR = {
    NODE_INFO : ["dev_info"],
    NODE_PHOTO : ["ifuse_user/PhotoData/Metadata/DCIM/100APPLE", "ifuse_user/DCIM/100APPLE"],
    NODE_VIDEO : ["ifuse_user/DCIM/100APPLE"],
    NODE_DATA : ["appmnt", "filerelay/var/mobile/Library/Caches"],
    #NODE_SMS : ["filerelay/var/mobile/Library/SMS/sms.db", "imessage/sms","filerelay/var/mobile/Library/SMS/Attachments"],
    NODE_SMS : ["filerelay/var/mobile/Library/SMS/sms.db"],
    NODE_ADDRESS : ["filerelay/var/mobile/Library/AddressBook/AddressBook.sqlitedb"],
    NODE_DATE : ["filerelay/var/mobile/Library/Calendar/Calendar.sqlitedb"],
    NODE_SETTING : ["filerelay/Library/Preferences/SystemConfiguration", "filerelay/var/log/ppp", "filerelay/var/mobile/Library/MobileInstallation", "filerelay/var/mobile/Library/Preferences", "filerelay/var/mobile/Library/Assets"],
    NODE_LOG : ["filerelay/var/logs/AppleSupport", "filerelay/var/mobile/Library/Logs"],
    NODE_NOTE : ["filerelay/var/mobile/Library/Notes/notes.sqlite"],
    NODE_JAILBREAK : ["keychain_data", "ifuse_root", "ifuse_root/mail_data/Recents", "ifuse_root/Cookies.binarycookies", "ifuse_root/call_history.db", "ifuse_root/Bookmarks.db"]
}

NODE_TYPE = {
    NODE_INFO : (),
    NODE_JAILBREAK:(".txt", ".json", ".log", ".js", ".xml", ".plist"),
    NODE_PHOTO : (".jpg",".JPG",".jpeg" ,".JPEG",".png", ".PNG", ".gif", ".GIF", ".thm", ".THM", ".BMP", ".bmp"),
    NODE_VIDEO : (".MOV", ".mov", ".mp4", ".MP4",".3GP", ".AVC", ".AVI", "MPEG-4"),
    NODE_DATA : (),
    NODE_SMS : (".db", ".sqlitedb"),
    NODE_ADDRESS : (".db", ".sqlitedb"),
    NODE_DATE : (".db", ".sqlitedb"),
    NODE_SETTING : (".txt", ".json", ".log", ".js", ".xml", ".plist"),
    NODE_LOG : (".txt", ".json", ".log", ".js", ".xml", ".plist"),
    NODE_NOTE : (".db", ".sqlitedb")
}

DUMP_DATA_DIR = "/root/phoneinfos/"
CONFIG_FILE_DIR = "/var/newcharger/tmp.cfg"
SOURCE_DATA_DIR = "/var/newcharger/"
