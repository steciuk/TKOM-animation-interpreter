# Interpreter języka do budowania dwuwymiarowych scen graficznych

_Autor: Adam Steciuk (300263)_
_kwiecień 2021_

Projekt polega na stworzeniu interpretera języka do budowania dwuwymiarowych scen graficznych oraz ich animowania. Wykonany zostanie w języku JavaScript z użyciem biblioteki [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API). W ramach projektu utworzony zostanie prosty serwis internetowy pozwalający na wgranie pliku z kodem do zinterpretowania oraz wyświetlenie rezultatu jego wykonania.

### Opis funkcjonalny

Język pozwoli na:

-   Tworzenie sceny graficznej o zadanych rozmiarach:
    -   `canvas(sizeX, sizeY)`
-   Czyszczenie dotychczas narysowanych obiektów:
    -   `clear()`
-   Definiowanie punktów w przestrzeni i przypisywanie ich do zmiennych:
    -   `p(posX, posY)`
-   Definiowanie koloru RGB i przypisanie go do zmiennej:
    -   `rgb(rVal, gVal, bVal)`
-   Tworzenie podstawowych figur geometrycznych oraz definiowanie ich koloru i przypisywanie ich do zmiennych:
    -   `circle(centerPoint, radius, color)`
    -   `rectangle(leftUpperPoint, width, height, color)`
    -   `polygon(point, point, point..., color)`
-   Kopiowanie zdefiniowanych obiektów do innych zmiennych
-   Modyfikowanie atrybutów obiektów także po ich utworzeniu
-   Odwoływanie się do atrybutów wewnętrznych obiektów
-   Używanie podstawowych transformacji poprzez funkcje utworzonej biblioteki standardowej:
    -   `move(obj, dirX, dirY)`
    -   `scale(obj, scaleX, scaleY)`
    -   `shear(obj, shearX, shearY)`
    -   `rotate(obj, point, angle)`
-   Grupowanie obiektów. Zgrupowane obiekty będą traktowanie tak samo jak obiekty proste (możliwe będzie dokonywania transformacji na całych grupach na raz oraz grupowanie ich w większe grupy)
    -   `group(object1, object2, object3...)`
-   Rysowanie obiektów:
    -   `draw(object)`
-   Tworzenie pętli typu for dla operacji synchronicznych, dla której definiować będzie można ilość wykonań.
    -   `for(n){operation};`
-   Tworzenie asynchronicznie wykonywanych pętli pętli typu for dla rysowania animacji, dla której definiować będzie można ilość wykonań oraz odstęp (w milisekudndach) między kolejnymi wykonaniami pętli.
    -   `afor(n, ms){operation};`
-   Definiowanie zmiennych przechowujących liczby całkowite oraz niecałkowite
-   Przeprowadzanie operacji arytmetycznych na zmiennych liczbowych
-   Tworzenie instrukcji warunkowych, obsługującej porównania między liczbami całkowitymi, niecałkowitymi czy zmiennymi przechowującymi te liczby:
    -   `if(val1 operator val2){operation}else{operation2}`
-   Definiowanie własnych funkcji nazwanych:
    -   `func name(args){operation; return object;}`
-   Dodawanie komentarzy zaczynających się oraz kończących się znakiem `#`.

### Dodatkowe założenia:

-   Język będzie ignorować białe znaki.
-   Każde polecenie kończyć się będzie średnikiem `;`.
-   Zmienne będą widoczne jedynie w przestrzeni w której zostaną zdefiniowane i wszystkich podprzestrzeniach tej przestrzeni.
-   Nie będzie występował "hoisting" zmiennych i funkcji. Próba odwołania się do zmiennej lub funkcji zainicjalizowanej "niżej" w drzewie dokumentu będzie kończyło się błędem.
-   Wszystkie błędy będą kończyły się przerwaniem działania programu.
-   Użytkownik może nadpisać dodane d programu funkcjie biblioteczne.
-   Z dowolnego synchronicznie wykonywanego miejsca w programie można zwrócić dowolną wartość lub obiekt. Nie jest to możliwe z wnętrza pętli `afor`.
-   Użycie pustego wyrażenia `return` powoduje zwrócenie wartości `null` a zakończenie się programu, lub funkcji bez użycia słowa kluczowego `return` zwraca wartość `undefined`.

### Wymagania funkcjonalne:

-   Odczytywanie, parsowanie i analiza skryptów zapisanych w plikach tekstowych.
-   Kontrola poprawności wprowadzonych danych oraz poprawne zgłaszanie błędów wykrytych podczas kolejnych etapów analizy plików.
-   Poprawne wykonywanie zdefiniowanych operacji i wyświetlanie ich wyniku przeglądarce internetowej.

### Wymagania niefunkcjonalne:

-   Komunikaty o błędach powinny być czytelne i w jednoznaczny sposób zgłaszać rodzaj i miejsce wystąpienia błędu (nr linii, nr znaku, fragment błędnego kodu).
-   Interpreter powinien być łatwo skalowalny, powinna być możliwość prostego dodawania nowych tokenów, modyfikowania istniejących konstrukcji językowych czy definiowania nowych.

### Przykłady:

##### Wyświetlenie animacji samochodu poruszającego się w po jednym pikselu co 10 ms 250 pikseli w lewo a następnie o 250 pikseli w prawo:

```
canvas(400, 300);
red = rgb(255, 0, 0);
radius = 40;
wheel1 = circle(p(300, 260), radius, red);
wheel2 = circle(p(100, 260), radius, red);
body = polygon(
	p(40, 260),
	p(360, 260),
	p(360, 200),
	p(280, 200),
	p(240, 160),
	p(160, 160),
	p(120, 200),
	p(40, 200),
	rgb(0, 255, 0)
);
blue = rgb(0, 0, 255);
window1 = polygon(p(130, 200), p(160, 170), p(160, 200), blue);
window2 = rectangle(p(170, 170), 50, 30, blue);
car = group(wheel1, wheel2, body, window1, window2);

i = 0;
afor(500, 10) {
	i = i+1;
	if(i < 250){
		move(car, -1, 0);
	}else{
		move(car, 1, 0);
	};
	draw (car);
    clear();
};
```

##### Wyświetlenie animacji kwadratu obracającego się co 10 ms o jeden stopień zgodnie z ruchem wskazówek zegara i liniowo oscylującego kolorem między czarnym a białym w nieskończonej pętli animacji:

```
func calculateCenterOfSquare(square){
	p1 = p(square.point.x + square.width / 2, square.point.y + square.height / 2);
	return p1;
};
canvas(400, 300);
i = 0;
square = rectangle(p(50, 100), 100, 100, rgb(0, 0, 0));
center = calculateCenterOfSquare(square);
flag = 1;
afor(0, 10){
	clear();
	if(flag == 1){
		if(i >= 255){
			flag = 0;
		}else{
			i = i + 1;
		};
	}else{
		if(i <= 0){
			flag = 1;
		}else{
			i = i - 1;
		};
	};
	square.color = rgb(i, 0, 0);
	rotate(square, center, 1);
	draw(square);
};
```

### Zdefiniowane słowa i znaki kluczowe:

`-`
`!`
`#`
`(`
`)`
`*`
`,`
`.`
`/`
`;`
`{`
`}`
`+`
`<`
`=`
`>`
`else`
`for`
`afor`
`func`
`if`
`return`

### Funkcje i polecania zdefiniowane w bibliotece standardowej:

`canvas`
`circle`
`clear`
`draw`
`group`
`move`
`polygon`
`rectangle`
`rgb`
`rotate`
`scale`
`shear`

### Gramatyka:

Między składowymi poniższych konstrukcji może być dowolna liczba białych znaków.

```
program = {command | func_definition};
comment = "#", { "0x00".."0xFF" - "#" }, "#";

command = ((expression, | for | if | afor), ";") | comment;
func_definition = "func",  id, "(", [id, {",", id}], ")", "{", {command, ";"}, "return", [id], ";", "}";
expression = assigment | func_callOrTransformation;
func_callOrTransformation = func_call, [{"*", func_call}, "*", id]
assigment = var_or_attribute, "=", arith_expression;
func_call = id, "(", args, ")";
args = [(var_or_attribute | number), {",", (var_or_attribute | number)}];

arith_expression = add_expression, {add_operator, add_expression};
add_expression = mult_expression, {mult_operator, mult_expression};
mult_expression = ["-"], term;
term = var_or_attribute | func_call | number | ("(", arith_expression, ")");
var_or_attribute = id, {".", id};

for = "for", "(", arith_expression, ")", "{", {commmand}, "}";
afor = "afor", "(", arith_expression, ",", arith_expression ")", "{", {commmand}, "}";
if = "if", "(", condition, ")", "{", {command}, "}", ["else", "{", {command}, "}"];
condition = and_condition, {or_operator, and_condition};
and_condition = equal_condition, {and_operator, equal_condition};
equal_condition = relation_condition, [equal_operator, relation_condition];
relation_condition = base_condition, [relation_operator, base_condition];
negation_condition = [negation_operator], base_condition
base_condition = arith_expression;
```

Między składowymi poniższych konstrukcji nie może być białych znaków.

```
id = small_letter, {small_letter | big_letter | digit};
small_letter = "a".."z" ;
big_letter = "A".."Z";
digit = "0".."9" ;
non_zero = "1".."9" ;
integer = "0" | (non_zero, {digit});
decimal = integer, ".", digit, {digit};
number = integer | decimal
negation_operator = "!";
or_operator = "or";
and_operator = "and";
equal_operator = "==" | "!=";
relation_operator = "<" | ">" | "<=" | ">=";
add_operator = "+" | "-";
mult_operator = "*" | "/";
```

### Budowa programu:

Program będzie złożony z 5 modułów głównych odpowiedzialnych za kolejne etapy analizy pliku, oraz z modułów pomocniczych:

1.  Reader - odpowiada za obsługę wczytywania pliku, abstrakcję pozwalającą na czytanie znak po znaku, unifikację znaków końca linii. Kolejne znaki będą przekazywane do Scannera.
2.  Scanner (analiza leksykalna) - odpowiada za budowanie tokenów języka. Kolejne tokeny będzie przekazywał do Parsera przy każdym wywołaniu `getToken()`. Moduł będzie korzystał z tablicy poprawnych tokenów języka.
3.  Parser (analiza składniowa) - odpowiada z sprawdzenie czy otrzymane tokeny są ułożone zgodnie z gramatyką języka. Poprawne struktury gramatyczne będą tworzyć drzewo składniowe. Parser zwracać będzie obiekt `Program` z instrukcjami do wykonania, mapą zdefiniowanych funkcji oraz mapą podpiętych funkcji bibliotecznych.
4.  Executor (analiza semantyczna oraz wykonanie programu) - odpowiadać będzie za sprawdzenie poprawności "znaczenia" utworzonego przez Parser drzewa oraz wykonanie instrukcji. Kontrolować będzie poprawność używanych identyfikatorów, zgodność typów danych, zgodność kontekstów operacji arytmetycznych i logicznych, poprawność argumentów funkcji. Moduł będzie wykorzystywał budowane w czasie rzeczywistym drzewo zdefiniowanych identyfikatorów.

Dodatkowo wszystkie moduły będą współpracowały z modułem obsługi błędów.
