scriptify
=========

This script is used to generate a properly-formatted movie script from a text file using a very simple
markdown language. The following markdown commands are recognized:

[ - Start ignoring. All text until the closing ] will be ignored.
] - Stop ignoring. Closes the corresponding start ignore ([) character.
*** Title. The title of your script.
** Authorship. The byline for your script.
* SCENE HEADING. Also known as the slug line: * EXT. SURFACE OF MOON - DAY
+ Action. Describes the action happening on-screen.
> Character. Introduces character dialog.
(parenthetical) Also known as a wrylie.
# Comment. Editorial comments that will eventually be stripped from your script.

The script only recognizes these symbols as the first character on a line. Any line that doesn't start
with one of these special symbols is considered to be dialog.
