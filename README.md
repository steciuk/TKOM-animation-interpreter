


# Interpreter języka do budowania dwuwymiarowych scen graficznych
*Autor: Adam Steciuk (300263)*
*kwiecień 2021*

Projekt polega na stworzeniu interpretera języka do budowania dwuwymiarowych scen graficznych oraz ich animowania. Wykonany zostanie w języku JavaScript z użyciem biblioteki [p5.js](https://p5js.org/). W ramach projektu utworzony zostanie prosty serwis internetowy pozwalający na wgranie pliku z kodem do zinterpretowania oraz wyświetlenie rezultatu jego wykonania.

### Opis funkcjonalny
Język pozwoli na:
 - Tworzenie sceny graficznej o zadanych rozmiarach:
	 - `canvas(sizeX, sizeY)`
 - Czyszczenie dotychczas narysowanych obiektów:
	 - `clear()`
 - Definiowanie punktów w przestrzeni i przypisywanie ich do zmiennych:
	 - `(posX, posY)`
 - Definiowanie koloru RGB i przypisanie go do zmiennej:
	 - `rgb(rVal, gVal, bVal)`
 - Tworzenie podstawowych figur geometrycznych oraz definiowanie ich koloru i przypisywanie ich do zmiennych:
	 - `circle(centerPoint, radius, color)`
	 - `rectangle(leftUpperPoint, width, height, color)`
	 - `polygon(point, point, point..., color)`
 - Kopiowanie zdefiniowanych obiektów do innych zmiennych
 - Modyfikowanie koloru figur także po ich utworzeniu
 - Odwoływanie się do atrybutów wewnętrznych obiektów
 - Używanie podstawowych transformacji:
	 - `move(dirX, dirY)`
	 - `scale(scaleX, scaleY)`
	 - `shear(shearX, shearY)`
	 - `rotate(point, angle)`
 - Wykonywanie przekształceń na obiektach poprzez znak mnożenia `*`. Symbole `operation1`, `operation2`, `operation3` to funkcje transformacji zdefiniowane w powyższym punkcie):
	 - `operation1 * object`
 - Składanie operacji poprzez znak mnożenia `*`:
	 - `operation1 * operation2 * operation3`
 - Grupowanie obiektów. Zgrupowane obiekty będą traktowanie tak samo jak obiekty proste (możliwe będzie dokonywania transformacji na całych grupach na raz oraz grupować je w większe grupy)
	 - `group(object1, object2, object3...)`
 - Rysowanie obiektów:
	 - `draw(object)`
 - Tworzenie pętli typu for, dla której definiować będzie można ilość wykonań, podanie 0 jako argument pętli powoduje wykonywanie się jej w nieskończoność:
	 - `for(n){operation};`
 - Definiowanie czasu wstrzymania działania programu (w milisekundach):
	 - `pause(n)`
 - Definiowanie zmiennych przechowujących liczby całkowite oraz niecałkowite
 - Przeprowadzanie operacji arytmetycznych na zmiennych liczbowych
 -  Tworzenie instrukcji warunkowych, obsługującej porównania między liczbami całkowitymi, niecałkowitymi czy zmiennymi przechowującymi te liczby:
	 - `if(val1 operator val2){operation}else{operation2}`
 - Definiowanie własnych funkcji nazwanych:
	 - `func name(args){operation; return object;}`
 - Dodawanie komentarzy zaczynających się oraz kończących się znakiem `#`. 

### Dodatkowe założenia:
 - Język będzie ignorować białe znaki. 
 - Każde polecenie kończyć się będzie średnikiem `;`.
 - Zmienne będą widoczne jedynie w przestrzeni w której zostaną zdefiniowane i wszystkich podprzestrzeniach tej przestrzeni.
 - Nie będzie występował "hoisting" zmiennych i funkcji. Próba odwołania się do zmiennej lub funkcji zainicjalizowanej "niżej" w drzewie dokumentu będzie kończyło się błędem.
 - Wszystkie błędy będą kończyły się przerwaniem działania programu.
 - Każda definicja funkcji musi kończyć się słowem kluczowym `return`

### Wymagania funkcjonalne:
 - Odczytywanie, parsowanie i analiza skryptów zapisanych w plikach tekstowych.
 - Kontrola poprawności wprowadzonych danych oraz poprawne zgłaszanie błędów wykrytych podczas kolejnych etapów analizy plików.
 - Poprawne wykonywanie zdefiniowanych operacji i wyświetlanie ich wyniku przeglądarce internetowej.

### Wymagania niefunkcjonalne:
- Komunikaty o błędach powinny być czytelne i w jednoznaczny sposób zgłaszać rodzaj i miejsce wystąpienia błędu (nr linii, nr znaku, fragment błędnego kodu).
- Interpreter powinien być łatwo skalowalny, powinna być możliwość prostego dodawania nowych tokenów, modyfikowania istniejących konstrukcji językowych czy definiowania nowych.

### Przykłady:
##### Wyświetlenie animacji samochodu poruszającego się w 10 razy o 100 pikseli w lewo a następnie o 100 pikseli w prawo:
```
canvas(400, 300); # tworzy obszar roboczy 400px x 300px #
r = 40; # zmienna int #
red = rgb(255, 0, 0); # zmienna przechowująca czerwony kolor #
wheel1 = circle((300, 260), r, red); # zmienna przechowująca kształt #
wheel2 = circle((10, 30), r, red);
pkt = (40, 260);
body = polygon(
	pkt,
	(360, 260),
	(360, 200),
	(280, 200),
	(240, 160),
	(160, 160),
	(120, 200),
	(40, 200),
	rgb(0, 255, 0)
);
blue = rgb(0, 0, 255);
window1 = polygon((130, 200), (160, 170), (160, 200), blue);
window2 = rectangle((170, 170), 50, 30);
car = group(wheel1, wheel2, body, window1, window2); # kolejność dodawania definiuje kolejność rysowania #
for(10){
	for(100){
		clear();
		move(-1, 0) * car; # przesuń samochód w lewo o jeden piksel #
		draw(car);
		pause(10);
	};
	for(100){
		clear();
		move(1, 0) * car; # przesuń samochód w prawo jeden piksel #
		draw(car);
		pause(10);
	};
};
```
##### Wyświetlenie animacji kwadratu obracającego się co 10 ms o jeden stopień przeciwnie do ruchu wskazówek zegara i  liniowo oscylującego kolorem między czarnym a białym w nieskończonej pętli animacji:
```
func calculateCenterOfSquare(square){
	p = (square.origin.x + square.width / 2, square.origin.y + square.height / 2);
	return p;
};
canvas(400, 300);
i = 0
square = rectangle((50, 100), 100, 100, rgb(i, i, i))
center = calculateCenterOfSquare(square);
flag = 1;
for(0){
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
	square.color = rgb(i, i, i);
	rotate(center, 1) * sqaure;
	draw(square);
	pause(10);
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
`pause`
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

command = ((expression, | for | if ), ";") | comment;
func_definition = "func",  id, "(", [id, {",", id}], ")", "{", {command, ";"}, "return", [id], ";", "}";
expression = assigment | func_callOrTransformation;
func_callOrTransformation = func_call, [{"*", func_call}, "*", id]
assigment = var_or_attribute, "=", arith_expression;
func_call = id, "(", args, ")";
args = [(var_or_attribute | number), {",", (var_or_attribute | number)}];

arith_expression = add_expression, {add_operator, add_expression};
add_expression = mult_expression, {mult_operator, mult_expression};
mult_expression = ["-"], term;
term = var_or_attribute | func_call | number | ("(", arith_expression, ")";
var_or_attribute = id, {".", id};

for = "for", "(", arith_expression, ")", "{", {commmand}, "}";
if = "if", "(", condition, ")", "{", {command}, "}", ["else", "{", {command}, "}"];
condition = and_condition, {or_operator, and_condition};
and_condition = equal_condition, {and_operator, equal_condition};
equal_condition = relation_condition, [equal_operator, relation_condition];
relation_condition = base_condition, [relation_operator, base_condition];
negation_condition = [negation_operator], base_condition 
base_condition = (("(", condition, ")") | number | var_or_attribute);
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
or_perator = "or";
and_operator = "and"; 
equal_operator = "==" | "!="; 
relation_operator = "<" | ">" | "<=" | ">=";
add_operator = "+" | "-";
mult_operator = "*" | "/";
```
### Budowa programu:
Program będzie złożony z 5 modułów głównych odpowiedzialnych za kolejne etapy analizy pliku, oraz z modułów pomocniczych:

 1. Reader - odpowiada za obsługę wczytywania pliku, abstrakcję  pozwalającą na czytanie znak po znaku, unifikację znaków końca linii. Kolejne znaki będą przekazywane do Scannera.
 2. Scanner (analiza leksykalna) -  odpowiada za budowanie tokenów języka. Kolejne tokeny będzie przekazywał do Parsera przy każdym wywołaniu `getNextToken()`. Moduł będzie korzystał z tablicy poprawnych tokenów języka.
 3. Parser (analiza składniowa)  - odpowiada z sprawdzenie czy otrzymane tokeny są ułożone zgodnie z gramatyką języka. Poprawne struktury gramatyczne będą tworzyć drzewo składniowe.
 4. SemCheck (analiza semantyczna) - odpowiadać będzie za sprawdzenie poprawności "znaczenia" utworzonego przez Parser drzewa. Kontrolować będzie poprawność używanych identyfikatorów, zgodność typów danych,  zgodność kontekstów operacji arytmetycznych i logicznych, poprawność argumentów funkcji.  Będzie generować drzewo instrukcji do wykonania dla modułu wykonawczego. Moduł będzie współpracował z modułem zdefiniowanych identyfikatorów
 5. Executor - odpowiada za wykonanie instrukcji zawartych w drzewie utworzonym przez SemCheck.

Dodatkowo wszytskie moduły będą współpracowały z modułem obsługi błędów.