# Automatische Berechnung von Nullstellen

## Lösungsverfahren: Newton

Zum Lösen der Nullstellen verwendet dieses Programm das Newtonverfahren.

<a href="https://de.wikipedia.org/wiki/Newtonverfahren">Newtonverfahren</a>

  Das Programm muss hiefür nur mit einem nutzergewählten Wert für x anfangen. Anschließend wird der Anstieg an der Stelle abgeschätzt. Die Tangente, welche an dieser Stelle angelegt wird, muss eine Nullstelle haben.  
Falls eine Nullstelle existiert, muss jene als neuer x-Wert festgelegt werden und der Prozess wird wiederholt.  
Falls keine Nullstelle existiert, wird der x-Wert leicht verändert.

Obwohl die obengenannte Methode niemals ein Ergebniss generiert, nähert sich (meistens) der x-Wert immer mehr einer Nullstelle an. Die Wiederholungen können durch einen Genauigkeits-Wert reguliert werden.  
Dadurch wird zwar auch ein Ergebniss für y=2 ausgegeben, welche natürlich keine Nullstelle hat, stellt aber kein Problem dar, wenn der Nutzer über diese Tatsache informeirt wird.

Eine Funktion c(n+1) berechnet die Nullstelle der Tangente bei c(n). Dann lautet diese wie folgt:

<b> c(n+1) = c(n) - ( f(c(n)) / f'(c(n)) ) | n ∈ ℕ</b>

wobei f(x) die ursprüngliche Funtion ist.

Dann gilt für `n → ∞` und `n ∈ ℕ`:

<b>f(c(n)) = 0</b>

Welche Nullstelle hiermit ermittelt wird, hängt von c(0) ab, was als Anfangswert definiert wurde.

## Implementiertung

Die Webapp wird mithilfe des Frameworks [NextJS](https://www.nextjs.org) (-> React.js) geschrieben.

Im Quelltext ist der Programmiercode, welcher das Newtonvefahren betrifft in der Datei unter `/components/CardRight.jsx` in der Funktion `findRoots` zu finden. Der Code wird aber auch in dieser Datei enthalten sein und erklärt werden.

Wurde ein initiales x ausgewählt, so schätzt der folgende Code die Nullstellen.  

    let y = 0;  \n
    for (let i=0;i<vars.acc;i++) {  
      let m;  
      try {  
        y = f.evaluate({ x: x });  
        m = df.evaluate({ x: x });
        if (y===NaN || y===-Infinity || y===Infinity)  
          return;  
      } catch(err) {  
        return;  
      }
      if (m === 0) {  
        x += 2;  
        continue;  
      }  
      x = x - (y / m);  
    }
    return x;<br>

Variablen wie `x`, `vars`, `f` und `df` sind bereits im globalen Namespace vorhanden. `f` ist die eingegebene Funktion. `df` ist die Ableitungsfunktion von `f`. Innerhalb von `vars` sind Variablen gespeichert, welche die Parameter des Programms enthalten. `x` ist einer von beliebig vielen Werten, die vom Benutzer festgelegt wurden. `return` kann verwendet werden, weil der code innerhalb der Funktion `findRoots` enthalten ist.

Zuerst wird die Variable y, welche für den Funktionswert am alten x steht definiert. Als nächstes wird eine Schleife gestartet, welche durch die Variable `acc` beschränkt ist (innerhalb des `vars` Objekts). Anschließend wird eine Variable `m` deklariert, welche für den Wert der Ableitung am alten x steht.

Die anschließenden Schritte, y und m festzulegen, sind in einem try-catch-block enthalten, da diese Fehler aufweisen können, falls die Funktion oder Ableitung derselben ungültig ist. Tritt so ein Fehler auf oder der Funktionswert `y` ist nicht gültig, so wird die Funktion beendet und gibt ein `undefined` zurürck. Ansonsten sollte x nach der Schleife zurückgegeben werden. (Im originalen Quelltext wird es zu einer Menge an Lösungen hinzugefügt.)

