function GetFileContent (FileName) // Получение содержимого файла
{
    var fso = new ActiveXObject ('Scripting.FileSystemObject');

    if (fso.FileExists (FileName)) {

        var File = fso.OpenTextFile (FileName, 1, false, -1);
        var Content = File.ReadAll ();
        File.Close ();

        return Content;
    }

    return false;
}

function IsArray (Obj)
{
   if (Obj === undefined) return false;
   if (Obj === null     ) return false;
   if (typeof (Obj) !== 'object') return false;
   return (Obj.constructor === Array);
}

function ShowObject (Val, Level)
{
   if (!Level) Level = 0;
   if (Level > 5) return '[...]';

   var Out = '';
   var Indent = '';
   for (var i = 0; i < Level; i++) Indent += '   ';

   if (typeof (Val) == 'object') {
      Out += (IsArray (Val)? '[': '{') + '\n';
      for (var i in Val) Out += Indent + '   ' + i + ': ' + ShowObject (Val[i], Level + 1) + ',\n';
      if (Out.substring (Out.length - 2) == ',\n') Out = Out.substring (0, Out.length - 2) + '\n';
      Out += Indent + (IsArray (Val)? ']' : '}');
   }
   else if (typeof (Val) == 'string') Out += '"' + Val + '"';
   else Out += ' ' + Val;

   return Out;
}

function Trim (Text, Symbols)
{
   if (Text === undefined) return undefined;

   var Start = 0;
   var End = Text.length - 1;

   if (Symbols === undefined) {
      while (Start <= End && Text.charAt (Start) == ' ') Start++;
      while (End  > Start && Text.charAt (End  ) == ' ') End--;
   }
   else {
      while (Start <= End && Symbols.indexOf (Text.charAt (Start)) != -1) Start++;
      while (End  > Start && Symbols.indexOf (Text.charAt (End  )) != -1) End--;
   }

   if (Start == 0 && End == Text.length - 1) return Text;

   return Text.substr (Start, End - Start + 1);
}