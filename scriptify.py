#!/usr/bin/env python
import optparse
import sys
from string import Template

def transform(template, f):
  scd = {'*':'slug', '**':'byline', '***':'title', '+':'action', '>':'character', '(':'paren', '/':'transition', '#':'comment'}
  pd = {'title':'(untitled)'}
  ignore = 0
  body = ""
  
  for line in f:
    if line:
      c, s, r = line.partition(' ')
      c = c.strip()
      if not s:
        c = line[0]
        
      if c == '[':
        ignore += 1
      elif c == ']':
        ignore -= 1
      elif c in scd:
        dc = scd[c]
        if dc == 'title' or dc == 'byline':
          pd[dc] = r
      else:
        c = None
        dc = 'dialog'
      
      if c:
        line = line[len(c):]
    
      line = line.strip()
      
      if ignore <= 0 and line and dc:
        body = body + '<div class="%s">%s</div>\r\n' % (dc, line)
  
  pd['body'] = body
  
  print template.safe_substitute(pd)
  
def main():
  p = optparse.OptionParser()
  p.add_option("-t", "--template", dest="template",
                  help="specify the template to use", default='scriptify-default.html')
  options, arguments = p.parse_args()
  
  t = Template(open(options.template).read())
  
  if not arguments:
    transform(t, sys.stdin)
  else:
    for fn in arguments:
      transform(t, open(fn))
      

if __name__ == '__main__':
  main()