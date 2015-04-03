#! /usr/bin/python
#-*- coding: utf-8 -*-
import tornado.ioloop
import tornado.web
from tornado.escape import *
import mimetypes, email, stat, sqlite3
import os, json, time, datetime, ConfigParser, plistlib
from filePoint  import *
from os.path import join, getsize
from CookieReader import *
from constants import *
from usualfunc import *
import subprocess
import sys
reload(sys)
sys.setdefaultencoding('utf-8')


def initlog():
    import logging
    logger = logging.getLogger()
    hdlr = logging.FileHandler(os.path.join(SOURCE_DATA_DIR, 'debug.txt'))
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(pathname)s %(lineno)s %(message)s')
    hdlr.setFormatter(formatter)
    logger.addHandler(hdlr)
    logger.setLevel(logging.INFO)
    return logger

logger=initlog()
fp = FilePoint()

def getPackage():
    package = []
    try:
        for pp in os.listdir(DUMP_DATA_DIR):
            path = os.path.join(DUMP_DATA_DIR, pp)
            if not os.path.isdir(path):
                continue
            package.append(pp)
    except Exception, e:
        logger.error("get package error: %s"%e)
    return package

def recursion(path, filetype):
    records = []
    if os.path.exists(path):
        for file in os.listdir(path):
            pp = os.path.join(path, file)
            if not os.path.exists(pp):
                continue
            if os.path.isdir(pp):
                templist =  recursion(pp, filetype)
                records.extend(templist)
            else:
                suffix = os.path.splitext(pp)[1]
                if filetype and suffix.lower() not in filetype:
                    continue
                key = fp.set(pp)
                temp = {}
                temp["filename"] = file
                temp["md5"] = key
                temp["abspath"] = pp
                records.append(temp)
    return records

def checkType(suffix):
    if not suffix:
        return TYPE_IMG 
    suffix = suffix.lower()
    if suffix in TYPE_IMG_DICT:
        return TYPE_IMG
    if suffix in TYPE_VIDEO_DICT:
        return TYPE_VIDEO
    if suffix==".db" or suffix==".sqlitedb" or suffix==".sqlite":
        return TYPE_DBFILE
    if suffix in TYPE_TEXT_DICT:
        return TYPE_TEXTFILE
    if suffix==".plist":
        return TYPE_PLISTFILE
    return TYPE_OTHER

class LogHandler(tornado.web.RequestHandler):
    def get(self):
        flag = self.get_argument("data", False)
        nav = "log"
        package = getPackage()
        if len(package)>0 and not self.get_cookie("currentPackage"):
            self.set_cookie("currentPackage", package[0])
        cur = self.get_cookie("currentPackage")
        if not flag:
            self.render("templates/log.html", param = {"nav": nav, "package":package, "cur":cur})
        else:
            return_data = {"status": 200, "message": "ok"}
            records = {}
            try:
                for path in NODE_DIR[NODE_LOG]:
                    index = path.rsplit("/",1)[1]
                    records[index] = []
                    abspath = os.path.join(DUMP_DATA_DIR, cur, path)
                    if os.path.exists(abspath):
                        try:
                            if os.path.isdir(abspath):
                                records[index].extend(recursion(abspath, NODE_TYPE[NODE_LOG]))
                            else:
                                key = fp.set(abspath)
                                temp = {}
                                temp["filename"] = os.path.basename(abspath)
                                temp["md5"] = key
                                records[index].append(temp)
                        except Exception, e:
                            logger.error("Error: %s"%e)
                            pass
                        finally:
                            pass
                return_data["records"] = records
                self.write(json.dumps(return_data))
            except Exception, e:
                logger.error("Error : %s"%e)
                self.write(json.dumps({"status": 201, "message": "error"}))

class PhotoHandler(tornado.web.RequestHandler):
    def get(self):
        flag = self.get_argument("data", False)
        nav = "photo"
        package = getPackage()
        if len(package)>0 and not self.get_cookie("currentPackage"):
            self.set_cookie("currentPackage", package[0])
        cur = self.get_cookie("currentPackage")
        if not flag:
            self.render("templates/photo.html", param={"nav": nav, "package":package, "cur":cur})
        else:
            return_data = {"status": 200, "message": "ok"}
            records = []
            try:
                for path in NODE_DIR[NODE_PHOTO]:
                    abspath = os.path.join(DUMP_DATA_DIR, cur, path)
                    if os.path.exists(abspath):
                        try:
                            if os.path.isdir(abspath):
                                records.extend(recursion(abspath, NODE_TYPE[NODE_PHOTO]))
                            else:
                                key = fp.set(abspath)
                                temp = {}
                                temp["filename"] = os.path.basename(abspath)
                                temp["md5"] = key
                                records.append(temp)
                        except Exception, e:
                            logger.error("Error: %s"%e)
                            pass
                        finally:
                            pass
                return_data["records"] = records
                self.write(json.dumps(return_data))
            except Exception, e:
                logger.error("Error : %s"%e)
                self.write(json.dumps({"status": 201, "message": "error"}))

class AddressHandler(tornado.web.RequestHandler):
    def get(self):
        flag = self.get_argument("data", False)
        nav = "address"
        package = getPackage()
        if len(package)>0 and not self.get_cookie("currentPackage"):
            self.set_cookie("currentPackage", package[0])
        cur = self.get_cookie("currentPackage")
        if not flag:
            self.render("templates/address.html", param={"nav": nav, "package":package, "cur":cur})
        else:
            return_data = {"status": 200, "message": "ok"}
            records = []
            try:
                for path in NODE_DIR[NODE_ADDRESS]:
                    abspath = os.path.join(DUMP_DATA_DIR, cur, path)
                    if os.path.exists(abspath):
                        try:
                            conn = sqlite3.connect(abspath)
                            c = conn.cursor()
                            query = "select c0First, c1Last, c6Organization, c7Department, c9Birthday, c10JobTitle, c11Nickname, c15Phone, c16Email, c17Address from ABPersonFullTextSearch_content;"
                            allrecords = c.execute(query).fetchall()
                            for item in allrecords:
                                r = {}
                                r["first"] = item[0] if item[0] else ""
                                r["last"] = item[1] if item[1] else ""
                                r["Organization"] = item[2] if item[2] else ""
                                r["Department"] = item[3] if item[3] else ""
                                r["Birthday"] = item[4] if item[4] else ""
                                r["JobTitle"] = item[5] if item[5] else ""
                                r["Nickname"] = item[6] if item[6] else ""
                                r["phone"] = item[7].split(" ")[0] if item[7] else ""
                                r["email"] = item[8] if item[8] else ""
                                r["address"] = item[9] if item[9] else ""
                                records.append(r)
                        except Exception, e:
                            logger.error("Error: %s"%e)
                            pass
                        finally:
                            conn.close()
                return_data["records"] = records
                self.write(json.dumps(return_data))
            except Exception, e:
                logger.error("Error : %s"%e)
                self.write(json.dumps({"status": 201, "message": "error"}))

class CalendarHandler(tornado.web.RequestHandler):
    def get(self):
        flag = self.get_argument("data", False)
        nav = "calendar"
        package = getPackage()
        if len(package)>0 and not self.get_cookie("currentPackage"):
            self.set_cookie("currentPackage", package[0])
        cur = self.get_cookie("currentPackage")
        if not flag:
            self.render("templates/calendar.html", param={"nav": nav, "package":package, "cur":cur})
        else:
            return_data = {"status": 200, "message": "ok"}
            records = []
            try:
                for path in NODE_DIR[NODE_DATE]:
                    abspath = os.path.join(DUMP_DATA_DIR, cur, path)
                    if os.path.exists(abspath):
                        try:
                            conn = sqlite3.connect(abspath)
                            c = conn.cursor()
                            query = "select Location.ROWID, Location.title, CalendarItem.summary, CalendarItem.description, Participant.email from Location, CalendarItem, Participant where Location.item_owner_id = CalendarItem.ROWID and Location.item_owner_id = Participant.owner_id;"
                            allrecords = c.execute(query).fetchall()
                            r = {} 
                            for item in allrecords:
                                if r.has_key(item[0]):
                                    r[item[0]]["mailist"].append(item[4] if item[4] else "")
                                else:
                                    r[item[0]] = {"title":item[1] if item[1] else "", "summary": item[2] if item[2] else "", "desc": item[3] if item[3] else "", "mailist":[item[4] if item[4] else ""]}
                            records = r.values()
                        except Exception, e:
                            logger.error("Error: %s"%e)
                            pass
                        finally:
                            conn.close()
                return_data["records"] = records
                self.write(json.dumps(return_data))
            except Exception, e:
                logger.error("Error : %s"%e)
                self.write(json.dumps({"status": 201, "message": "error"}))


class ConfigHandler(tornado.web.RequestHandler):
    def get(self):
        flag = self.get_argument("data", False)
        nav = "config"
        package = getPackage()
        if len(package)>0 and not self.get_cookie("currentPackage"):
            self.set_cookie("currentPackage", package[0])
        cur = self.get_cookie("currentPackage")
        if not flag:
            self.render("templates/config.html", param={"nav": nav, "package":package, "cur":cur})
        else:
            return_data = {"status": 200, "message": "ok"}
            records = {}
            try:
                for path in NODE_DIR[NODE_SETTING]:
                    index = path.rsplit("/",1)[1]
                    records[index] = []
                    abspath = os.path.join(DUMP_DATA_DIR, cur, path)
                    if os.path.exists(abspath):
                        try:
                            if os.path.isdir(abspath):
                                records[index].extend(recursion(abspath, NODE_TYPE[NODE_SETTING]))
                            else:
                                key = fp.set(abspath)
                                temp = {}
                                temp["filename"] = os.path.basename(abspath)
                                temp["md5"] = key
                                records[index].append(temp)
                        except Exception, e:
                            logger.error("Error: %s"%e)
                            pass
                        finally:
                            pass
                return_data["records"] = records
                self.write(json.dumps(return_data))
            except Exception, e:
                logger.error("Error : %s"%e)
                self.write(json.dumps({"status": 201, "message": "error"}))

class DataHandler(tornado.web.RequestHandler):
    def get(self):
        flag = self.get_argument("data", False)
        nav = "data"
        package = getPackage()
        if len(package)>0 and not self.get_cookie("currentPackage"):
            self.set_cookie("currentPackage", package[0])
        cur = self.get_cookie("currentPackage")
        if not flag:
            self.render("templates/data.html", param={"nav": nav, "package":package, "cur":cur})
        else:
            return_data = {"status": 200, "message": "ok"}
            records = {"appmnt":[], "Caches":[]}
            try:
                for path in NODE_DIR[NODE_DATA]:
                    index = "appmnt" if path=="appmnt" else "Caches"
                    abspath = os.path.join(DUMP_DATA_DIR, cur, path)
                    if os.path.exists(abspath):
                        try:
                            if os.path.isdir(abspath):
                                records[index].extend(recursion(abspath, NODE_TYPE[NODE_DATA]))
                            else:
                                key = fp.set(abspath)
                                temp = {}
                                temp["filename"] = os.path.basename(abspath)
                                temp["md5"] = key
                                records[index].append(temp)
                        except Exception, e:
                            logger.error("Error: %s"%e)
                            pass
                        finally:
                            pass
                return_data["records"] = records
                self.write(json.dumps(return_data))
            except Exception, e:
                logger.error("Error : %s"%e)
                self.write(json.dumps({"status": 201, "message": "error"}))

class InfoHandler(tornado.web.RequestHandler):
    def get(self):
        flag = self.get_argument("data", False)
        nav = "info"
        package = getPackage()
        if len(package)>0 and not self.get_cookie("currentPackage"):
            self.set_cookie("currentPackage", package[0])
        cur = self.get_cookie("currentPackage")
        if not flag:
            self.render("templates/info.html", param={"nav": nav, "package":package, "cur":cur})
        else:
            return_data = {"status": 200, "message": "ok"}
            infodata = {
                    "ActivationState": "",
                    "DeviceName" : "",
                    "ProductType" : "",
                    "BuildVersion" : "",
                    "CPUArchitecture": "",
                    "ChipID": "",
                    "ChipSerialNo":"",
                    "DeviceColor":"",
                    "FirmwareVersion":"",
                    "ProductVersion" : "",
                    "HardwareModel" : "",
                    "HardwarePlatform":"",
                    "RegionInfo" : "",
                    "SerialNumber" : "",
                    "WiFiAddress" : "",
                    "BluetoothAddress" : "",
                    "UniqueDeviceID" : "",
                    "InternationalMobileEquipmentIdentity" : "",
                    "ModelNumber":"",
                    "PasswordProtected":"",
                    "MLBSerialNumber" : "",
                    "TimeZone":"",
                }
            try:
                for path in NODE_DIR[NODE_INFO]:
                    abspath = os.path.join(DUMP_DATA_DIR, cur, path)
                    fd = open(abspath, "r")
                    for line in fd.readlines():
                        arr = line.split(":", 1) if line else []
                        if len(arr) == 2 and infodata.has_key(arr[0].strip()) :
                            infodata[arr[0].strip()] = arr[1].strip()
                return_data["data"] = infodata
            except Exception, e:
                logger.error("Error : %s"%e)
                self.write(json.dumps({"status": 201, "message": "error"}))
            self.write(json.dumps(return_data))

class JailHandler(tornado.web.RequestHandler):
    def get(self):
        flag = self.get_argument("data", False)
        nav = "jail"
        package = getPackage()
        if len(package)>0 and not self.get_cookie("currentPackage"):
            self.set_cookie("currentPackage", package[0])
        cur = self.get_cookie("currentPackage")
        if not flag:
            self.render("templates/jail.html", param={"nav": nav, "package":package, "cur":cur})
        else:
            return_data = {"status": 200, "message": "ok", "flag":1}
            records = {}
            jail_file = os.path.join(DUMP_DATA_DIR, cur, "jailbreak")
            if os.path.exists(jail_file):
                with open(jail_file, "r") as fd:
                    if fd.read().rstrip("\n")!="1":
                        return_data["flag"] = 0
                        self.write(json.dumps(return_data))
                    else:
                        try:
                            for path in NODE_DIR[NODE_JAILBREAK]:
                                if path=="keychain_data" or path=="ifuse_root":
                                    index = path
                                else:
                                    index = "db"
                                records.setdefault(index, [])
                                abspath = os.path.join(DUMP_DATA_DIR, cur, path)
                                if os.path.exists(abspath):
                                    try:
                                        if os.path.isdir(abspath):
                                            records[index].extend(recursion(abspath, NODE_TYPE[NODE_JAILBREAK]))
                                        else:
                                            key = fp.set(abspath)
                                            temp = {}
                                            temp["filename"] = os.path.basename(abspath)
                                            temp["md5"] = key
                                            records[index].append(temp)
                                    except Exception, e:
                                        logger.error("Error: %s"%e)
                                        pass
                                    finally:
                                        pass
                            return_data["records"] = records
                            self.write(json.dumps(return_data))
                        except Exception, e:
                            logger.error("Error : %s"%e)
                            self.write(json.dumps({"status": 201, "message": "error"}))
            else:
                return_data["records"] = []
                self.write(json.dumps(return_data))    

class MessageHandler(tornado.web.RequestHandler):
    def get(self):
        flag = self.get_argument("data", False)
        nav = "message"
        package = getPackage()
        if len(package)>0 and not self.get_cookie("currentPackage"):
            self.set_cookie("currentPackage", package[0])
        cur = self.get_cookie("currentPackage")
        if not flag: 
            self.render("templates/message.html", param={"nav": nav, "package":package, "cur":cur})
        else:
            return_data = {"status": 200, "message": "ok"}
            records = []
            try:
                for path in NODE_DIR[NODE_SMS]:
                    abspath = os.path.join(DUMP_DATA_DIR, cur, path)
                    if os.path.exists(abspath):
                        try:
                            id = fp.set(abspath)
                            conn = sqlite3.connect(abspath)
                            c = conn.cursor()
                            query = "select chat.service_name, chat.chat_identifier, chat.account_login, message.text, message.ROWID from message, chat_message_join , chat where chat.ROWID=chat_message_join.chat_id and message.ROWID=chat_message_join.message_id"  
                            allrecords = c.execute(query).fetchall()
                            for item in allrecords:
                                r = {}
                                r["service_name"] = item[0]
                                r["sender"] = item[1]
                                r["receiver"] = item[2]
                                r["text"] = item[3]
                                qq = "select attachment.ROWID, attachment.filename, attachment.mime_type, attachment.total_bytes from attachment, message_attachment_join where message_attachment_join.message_id=%s and attachment.ROWID=message_attachment_join.attachment_id"%item[4]
                                attachment = []
                                for ii in c.execute(qq).fetchall():
                                    rr={}
                                    rr["url"] = "/download/?node_id=%s&attachment_id=%s"%(id,ii[0])
                                    rr["filename"] = os.path.basename(ii[1])
                                    rr["mime_type"] = ii[2]
                                    rr["bytesize"] = ii[3]
                                    attachment.append(rr)
                                r["attachment"] = attachment
                                records.append(r)
                        except Exception, e:
                            logger.error("Error: %s"%e)
                            pass
                        finally:
                            conn.close()
                return_data["records"] = records
                self.write(json.dumps(return_data))
            except Exception, e:
                logger.error("Error : %s"%e)
                self.write(json.dumps({"status": 201, "message": "error"}))

class NoteHandler(tornado.web.RequestHandler):
    def get(self):
        flag = self.get_argument("data", False)
        nav = "note"
        package = getPackage()
        if len(package)>0 and not self.get_cookie("currentPackage"):
            self.set_cookie("currentPackage", package[0])
        cur = self.get_cookie("currentPackage")
        if not flag:
            self.render("templates/note.html", param={"nav": nav, "package":package, "cur":cur})
        else:
            return_data = {"status": 200, "message": "ok"}
            records = []
            try:
                for path in NODE_DIR[NODE_NOTE]:
                    abspath = os.path.join(DUMP_DATA_DIR, cur, path)
                    if os.path.exists(abspath):
                        try:
                            conn = sqlite3.connect(abspath)
                            c = conn.cursor()
                            query = "select ZCONTENT from ZNOTEBODY"
                            allrecords = c.execute(query).fetchall()
                            for item in allrecords:
                                r = {}
                                r["title"] = item[0] if item[0] else ""
                                records.append(r)
                        except Exception, e:
                            logger.error("Error: %s"%e)
                            pass
                        finally:
                            conn.close()
                return_data["records"] = records
                self.write(json.dumps(return_data))
            except Exception, e:
                logger.error("Error : %s"%e)
                self.write(json.dumps({"status": 201, "message": "error"}))

class videoHandler(tornado.web.RequestHandler):
    def get(self):
        flag = self.get_argument("data", False)
        nav = "video"
        package = getPackage()
        if len(package)>0 and not self.get_cookie("currentPackage"):
            self.set_cookie("currentPackage", package[0])
        cur = self.get_cookie("currentPackage")
        if not flag:
            self.render("templates/video.html", param={"nav": nav, "package":package, "cur":cur})
        else:
            return_data = {"status": 200, "message": "ok"}
            records = []
            try:
                for path in NODE_DIR[NODE_VIDEO]:
                    abspath = os.path.join(DUMP_DATA_DIR, cur, path)
                    if os.path.exists(abspath):
                        try:
                            if os.path.isdir(abspath):
                                records.extend(recursion(abspath, NODE_TYPE[NODE_VIDEO]))
                            else:
                                key = fp.set(abspath)
                                temp = {}
                                temp["filename"] = os.path.basename(abspath)
                                temp["md5"] = key
                                records.append(temp)
                        except Exception, e:
                            logger.error("Error: %s"%e)
                            pass
                        finally:
                            pass
                return_data["records"] = records
                self.write(json.dumps(return_data))
            except Exception, e:
                logger.error("Error : %s"%e)
                self.write(json.dumps({"status": 201, "message": "error"}))

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        return_data = {"status": 200, "message": "ok", "package":[]}
        try:
            for package in os.listdir(DUMP_DATA_DIR):
                path = os.path.join(DUMP_DATA_DIR, package)
                if not os.path.isdir(path):
                    continue
                return_data["package"].append(path)
            self.write(json.dumps(return_data)) 
        except Exception, e:
            logger.error("get package error: %s"%e)
            self.write(json.dumps({"status":201, "message":u"服务器内部错误"})) 

    def post(self):
        return_data = {"status": 200, "message": "ok"}
        cur = self.get_argument("cur")
        try:
            self.set_cookie("currentPackage", cur)
            self.write(json.dumps(return_data)) 
        except Exception, e:
            logger.error("get package error: %s"%e)
            self.write(json.dumps({"status":201, "message":u"服务器内部错误"})) 
        
class NodeHandler(tornado.web.RequestHandler):
    def get(self, include_body=True):
        id = self.get_argument("nodeid")
        return_data = {"status": 200, "message": "ok"}
        abspath = fp.get(id)
        if not os.path.exists(abspath):
            self.write(json.dumps({"status": 404, "message": "file or fold does not exist"}))
        if not os.path.isfile(abspath):
            self.write(json.dumps({"status": 403, "message": "request is not a file"}))
        stat_result = os.stat(abspath)
        modified = datetime.datetime.fromtimestamp(stat_result[stat.ST_MTIME])
 
        self.set_header("Last-Modified", modified)
        if "v" in self.request.arguments:
            self.set_header("Expires", datetime.datetime.utcnow() + \
                                   datetime.timedelta(days=365*10))
            self.set_header("Cache-Control", "max-age=" + str(86400*365*10))
        else:
            self.set_header("Cache-Control", "public")
        mime_type, encoding = mimetypes.guess_type(abspath)
        if mime_type:
            self.set_header("Content-Type", mime_type)
        if not include_body:
            return
        file = open(abspath, "rb")
        try:
            self.write(file.read())
        finally:
            file.close() 

class AttachmentHandler(tornado.web.RequestHandler):
    """docstring for AttachmentHandler"""
    def get(self):
        attachment_id = self.get_argument("attachment_id")
        node_id = self.get_argument("node_id")
        try:
            attachment_id = int(attachment_id)
        except:
            attachment_id = 1
        abspath = fp.get(node_id)
        if not os.path.exists(abspath):
            self.write(json.dumps({"status": 404, "message": "data file does not exist"}))
        try:
            conn = sqlite3.connect(abspath)
            c = conn.cursor()
            query = "select attachment.filename from attachment where attachment.ROWID='%s'"%attachment_id
            record = c.execute(query).fetchone()
            filepath = os.path.join(abspath.split('filerelay', 1)[0], record[0].replace("~", "filerelay/var/mobile"))
            logger.info(filepath)
            if not os.path.exists(filepath):
                self.write(json.dumps({"status": 404, "message": "attachment file does not exist"}))
            if not os.path.isfile(filepath):
                self.write(json.dumps({"status": 403, "message": "request attachment is not a file"}))
            stat_result = os.stat(filepath)
            modified = datetime.datetime.fromtimestamp(stat_result[stat.ST_MTIME])
     
            self.set_header("Last-Modified", modified)
            if "v" in self.request.arguments:
                self.set_header("Expires", datetime.datetime.utcnow() + \
                                       datetime.timedelta(days=365*10))
                self.set_header("Cache-Control", "max-age=" + str(86400*365*10))
            else:
                self.set_header("Cache-Control", "public")
            self.set_header("Content-Type", "application/octet-stream")
            self.set_header('Content-Disposition',"attachment;filename=%s;charset=utf-8" %os.path.basename(filepath))
            conn.close()
            file = open(filepath, "rb")
            try:
                self.write(file.read())
            finally:
                file.close() 
        except:
            self.write(json.dumps({"status": 403, "message": "request attachment encount error"}))

class DetailHandler(tornado.web.RequestHandler):
    def get(self):
        id = self.get_argument("nodeid")
        abspath = fp.get(id)
        suffix = os.path.splitext(abspath)[1]
        filetype = checkType(suffix)
        return_data = {"status": 200, "message": "ok"}
        if not os.path.exists(abspath):
            self.write(json.dumps({"status": 404, "message": "file or fold does not exist"}))
        if not os.path.isfile(abspath):
            self.write(json.dumps({"status": 403, "message": "request is not a file"}))
        if os.path.basename(abspath)=="Cookies.binarycookies":
            data = []
            try:
                data = analysisCookie(abspath)
                return_data["data"] = data
                self.write(json.dumps(return_data))
            except Exception, e:
                self.write(json.dumps({"status": 201, "message": "error:%s"%e}))
        elif os.path.basename(abspath)=="Recents":
            data = {}
            records = []
            try:
                conn = sqlite3.connect(abspath)
                c = conn.cursor()
                try:
                    query = "select display_name, bundle_identifier, address, last_date from recents"
                    allrecords = c.execute(query).fetchall()
                except:
                    query = "select recents.display_name, recents.bundle_identifier, contacts.address, recents.last_date from recents, contacts where recents.ROWID=contacts.ROWID"
                    allrecords = c.execute(query).fetchall()
                for item in allrecords:
                    r = {}
                    r["display_name"] = item[0]
                    r["bundle_identify"] = "SMS:" if item[1]=="com.apple.MobileSMS" else "EMAIL:"
                    r["address"] = item[2]
                    if item[3]:
                        date = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(float(str(item[3])[:10])))
                    else:
                        date = ""
                    r["date"] = date
                    records.append(r)
            except Exception,e:
                pass
            finally:
                conn.close()
                data["records"] = records
                return_data["data"] = data
                self.write(json.dumps(return_data))
        elif os.path.basename(abspath)=="keychain_data":
            try:
                data = []
                fd = open(abspath, "r")
                templist = fd.read().split("Generic Password\n----------------\n")
                if len(templist) > 0:
                    for item in templist:
                        if item:
                            r = {}
                            for line in item.split("\n", 5):
                                arr = line.split(":", 1) if line else []
                                if len(arr) == 2:
                                    r[arr[0].strip().replace(" ", "")] = arr[1].strip() if arr[1].strip() else ""
                            if r:
                                data.append(r)
                fd.close()
                return_data["data"] = data
                self.write(json.dumps(return_data))
            except Exception, e:
                logger.error("Error : %s"%e)
                self.write(json.dumps({"status": 201, "message": "error"}))
        else:
            data = {"id": id, "filetype":filetype}
            data["space"] = byte_2_easy_read(getsize(abspath))
            data["name"] = os.path.basename(abspath)
            data["type"] = os.path.splitext(abspath)[1]
            if filetype == TYPE_DBFILE:
                dbname = data["name"].lower()
                records = []
                try:
                    conn = sqlite3.connect(abspath)
                    c = conn.cursor()
                    if dbname=="bookmarks.db":
                        query = "select title, url from bookmarks"
                        allrecords = c.execute(query).fetchall()
                        for item in allrecords:
                            r = {}
                            r["title"] = item[0] if item[0] else ""
                            r["url"] = item[1] if item[1] else ""
                            records.append(r)
                    elif dbname=="call_history.db":
                        try:
                            version = 7
                            cur = self.get_cookie("currentPackage")
                            devfile = os.path.join(DUMP_DATA_DIR, cur, "dev_info")
                            if os.path.exists(devfile):
                                fd = open(devfile, "r")
                                for line in fd.readlines():
                                    arr = line.split(":", 1) if line else []
                                    if len(arr) == 2 and arr[0].strip()=="ProductVersion" :
                                        version = arr[1].strip()
                                if version:
                                    version = safe_cast(version.split(".",1)[0], int, 7)
                        except Exception, e:
                            logger.error("Error : %s"%e)
                            pass
                        query = "select address, date, flags from call"
                        allrecords = c.execute(query).fetchall()
                        for item in allrecords:
                            r = {}
                            if item[1]:
                                date = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(item[1]))
                            else:
                                date = ""
                            if item[2]:
                                ttype = safe_cast(item[2], int, 0)
                                if version >=7 :
                                    vv = u"呼出" if ttype==9 else u"呼入"
                                else:
                                    if ttype==4: vv = u"呼入"
                                    elif ttype==5: vv = u"呼出"
                                    elif ttype==8: vv = u"blocking calls"
                                    else: vv=u"未知"
                            else:
                                vv=u"未知"
                            r["address"] = item[0] if item[0] else ""
                            r["date"] = date
                            r["type"] = vv
                            records.append(r)
                    else:
                        data["thead"] = []
                    data["records"] = records
                except Exception, e:
                    logger.error("Error: %s"%e)
                    pass
                finally:
                    conn.close()
            if filetype==TYPE_PLISTFILE or filetype==TYPE_TEXTFILE:
                file = open(abspath, "rb")
                try:
                    data["file"] = file.read()
                finally:
                    file.close()
            try:
                return_data["data"] = data
                self.write(json.dumps(return_data))
            except:
                if filetype==TYPE_PLISTFILE:
                    cmdline = "plistutil -i %s -o %s"%(abspath, abspath)
                    try:
                        subprocess.check_call(cmdline, shell=True)
                    except Exception, e:
                        pass
                    file = open(abspath, "rb")
                    try:
                        data["file"] = file.read()
                    finally:
                        file.close()
                    return_data["data"] = data
                else:
                    return_data={"status": 201, "message":u"文件解析有误"}
                self.write(json.dumps(return_data))


settings = {
    #"static_path": os.path.join(os.path.dirname(__file__), "static"),
    "static_path": os.path.join(SOURCE_DATA_DIR, "static"),
    "cookie_secret":"61oETzKXYJJFuYh7EQnp2XdTP1o/Vo=",
}

application = tornado.web.Application([
    (r"/", LogHandler),
    (r"/log/?", LogHandler),
    (r"/photo/?", PhotoHandler),
    (r"/address/?", AddressHandler),
    (r"/calendar/?", CalendarHandler),
    (r"/config/?", ConfigHandler),
    (r"/data/?", DataHandler),
    (r"/info/?", InfoHandler),
    (r"/jail/?", JailHandler),
    (r"/message/?", MessageHandler),
    (r"/note/?", NoteHandler),
    (r"/video/?", videoHandler),
    (r"/package", MainHandler),
    (r"/download/?", AttachmentHandler),
    (r"/node/?", NodeHandler),
    (r"/detail/?", DetailHandler)
], **settings)

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
