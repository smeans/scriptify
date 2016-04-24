#!/usr/bin/env python

# scriptify.py
#
#   Copyright 2013 W. Scott Means (smeans.com)
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
# 
#
# This script will convert a text file using a very simple markdown language
# into a properly formatted movie script (using the default template file
# provided). The markdown commands are:
# [ start ignoring
# ] stop ignoring
# *** Title
# ** Authorship
# * SCENE HEADING
# + Action
# > Character
# (parenthetical)
# / TRANSITION
# # Comment
# Any other text will be considered dialog.
#

import optparse
import sys
import os
import codecs
from string import Template
import cgi

def transform(template, f, of):
  scd = {'*':'slug', '**':'byline', '***':'title', '+':'action', '>':'character', '(':'paren', '/':'transition', '#':'comment'}
  pd = {'title':'(untitled)'}
  ignore = 0
  body = u""
  
  for line in f:
    if line:
      if line[0] == '(':
        c = '('
      else:
        c, s, r = line.partition(' ')
        c = c.strip()
        
      if not s:
        c = line[0]
        
      if c == '[':
        ignore += 1
      elif c == ']':
        ignore -= 1
      elif c == '#':
        line = ''
      elif c in scd:
        dc = scd[c]
        if dc == 'title' or dc == 'byline':
          pd[dc] = r
        if dc == 'paren':
          c = None
      else:
        c = None
        dc = 'dialog'
      
      if c:
        line = line[len(c):]
    
      line = line.strip()
      
      if ignore <= 0 and line and dc:
        body = body + u'<div class="%s">%s</div>\r\n' % (unicode(dc), unicode(line))
  
  pd['body'] = body
  
  of.write(template.safe_substitute(pd))
  
def main():
  p = optparse.OptionParser()
  p.add_option("-t", "--template", dest="template",
                  help="specify the template to use", default='scriptify-default.html')
  p.add_option("-e", "--encoding", dest="encoding",
                  help="specify the character encoding of the file", default='utf-16')
  options, arguments = p.parse_args()
  
  t = Template(codecs.open(options.template, 'r', 'utf-16').read())
  
  if not arguments:
    transform(t, sys.stdin, sys.stdout)
  else:
    for fn in arguments:
      of = codecs.open(os.path.splitext(fn)[0] + '.html', 'w', options.encoding)
      
      transform(t, codecs.open(fn, 'r', options.encoding), of)
      

if __name__ == '__main__':
  main()