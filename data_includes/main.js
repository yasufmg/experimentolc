//Inativa os comandos do IBex e sem eles o código não funciona
PennController.ResetPrefix(null); // Shorten command names (keep this line here))
PennController.DebugOff();

Header(
    // Declare global variables to store the participant's ID and demographic information
    newVar("ID").global(),
    newVar("GENERO").global(),
    newVar("NATIVO").global(),
    newVar("IDADE").global(),
    newVar("ESCOLARIDADE").global(),
    newVar("CERTIFICADO").global()
)

 // Add the participant info to all trials' results lines
.log( "ID"     , getVar("ID") )
.log( "GENERO" , getVar("GENERO") )
.log( "NATIVO" , getVar("NATIVO") )
.log( "IDADE"    , getVar("IDADE") )
.log( "ESCOLARIDADE" , getVar("ESCOLARIDADE") )
.log( "NASCIMENTO" , getVar("NASCIMENTO") )
.log( "RESIDENCIA" , getVar("RESIDENCIA") )
.log( "CERTIFICADO"   , getVar("CERTIFICADO") )

// Sequence of events: consent to ethics statement required to start the experiment, participant information, instructions, exercise, transition screen, main experiment, result logging, and end screen.
Sequence("consentimento", "participants", "instructions", randomize("exercise"), "start_experiment", rshuffle("experiment-filler", "experiment-item"), SendResults(), "end")

// TCLE - o experimento só começa se o participante aceitar
newTrial("consentimento",
    newHtml("ethics_explanation", "consentimento.html")
        .cssContainer({"margin":"1em"})
        .print()
    ,
    newHtml("form", `<div class='fancy'><input name='consent' id='consent' type='checkbox'><label for='consent'>Li e concordo em participar da pesquisa.</label></div>`)
        .cssContainer({"margin":"1em"})
        .print()
    ,
    newFunction( () => $("#consent").change( e=>{
        if (e.target.checked) getButton("go_to_info").enable()._runPromises();
        else getButton("go_to_info").disable()._runPromises();
    }) ).call()
    ,
    newButton("go_to_info", "Continuar")
        .cssContainer({"margin":"1em"})
        .disable()
        .print()
        .wait()
)

// Questionário dos participantes
newTrial("participants",
    defaultText
        .cssContainer({"margin-top":"1em", "margin-bottom":"1em"})
        .print()
    ,
    newText("participant_info_header", "<div class='fancy'><h2>Questionário sociodemográfico</h2><p>Por favor, complete esse questionário com algumas informações sobre você.</p></div>")
    ,
    // Participant ID
    newText("participantID", "<b>Informe seu nome completo ou suas iniciais.</b>")
    ,
    newTextInput("input_ID")
        .log()
        .print()
    ,
    // Genero
    newText("<b>Selecione o seu gênero</b>")
    ,
    newScale("input_genero",   "Feminino", "Masculino", "Outro", "Prefiro não responder")
        .radio()
        .log()
        .labelsPosition("right")
        .print()
    ,
    // Nativo
        newText("<b>O português brasileiro é sua língua materna (ou seja, a primeira língua que você aprendeu)?</b>")
    ,
    newScale("input_nativo",   "Sim", "Não")
        .radio()
        .log()
        .labelsPosition("right")
        .print()
    ,
    // Idade
    newText("<b>Qual a sua idade?</b><br>(responda usando números)")
    ,
    newTextInput("input_idade")
        .length(2)
        .log()
        .print()
    ,
    // Escolaridade
    newText("<b>Qual sua escolaridade?</b>")
    ,
    newScale("input_escolaridade",   "Primeiro Grau completo ou cursando", "Segundo grau completo ou cursando", "Curso universitário completo ou cursando")
        .radio()
        .log()
        .labelsPosition("right")
        .print()
    ,
            // Cidade em que nasceu
    newText("<b>Qual é sua cidade e estado de nascimento?</b>")
    ,
    newTextInput("input_nascimento")
        .log()
        .print()
    ,
        // Cidade em que reside
    newText("<b>Qual é sua cidade e estado de residência?</b>")
    ,
    newTextInput("input_residencia")
        .log()
        .print()
    ,    
        // Certificado
    newText("<b>Se quiser receber certificado de participação, deixe seu e-mail aqui:</b>")
    ,
    newTextInput("input_certificado")
        .log()
        .print()
    ,
    newText("<b>OBS.: O certificado de participação apenas será enviado caso você tenha deixado seu nome completo.</b>")
    .color("red")
    ,
    // Não aparecer erro caso o participante mude as informações
    newKey("just for callback", "") 
        .callback( getText("errorage").remove() , getText("errorID").remove() )
    ,
    // Formatting text for error messages
    defaultText.color("Crimson").print()
    ,
    // Continuar e só validar se tiver todas as infos
    newButton("continuar", "Continuar para instruções")
        .cssContainer({"margin-top":"1em", "margin-bottom":"1em"})
        .print()
        // Erros caso o participante não coloque as informações
        .wait(
             newFunction('dummy', ()=>true).test.is(true)
            // ID
            .and( getTextInput("input_ID").testNot.text("")
                .failure( newText('errorID', "Por gentileza, coloque seu nome ou iniciais.") )
            // Age
            ).and( getTextInput("input_idade").test.text(/^\d+$/)
                .failure( newText('errorage', "Por gentileza, coloque sua idade."), 
                          getTextInput("input_idade").text("")))  
        )
    ,
    // Cria novas variáveis que recebem o conteúdo nas caixas de textos respectivas
    getVar("ID")     .set( getTextInput("input_ID") ),
    getVar("GENERO") .set( getScale("input_genero") ),
    getVar("NATIVO")   .set( getScale("input_nativo") ),
    getVar("IDADE") .set( getTextInput("input_idade") ),
    getVar("ESCOLARIDADE")    .set( getScale("input_escolaridade") ),
    getVar("NASCIMENTO")    .set( getTextInput("input_nascimento") ),
    getVar("RESIDENCIA")    .set( getTextInput("input_residencia") ),
    getVar("CERTIFICADO") .set( getTextInput("input_certificado") )
)

// Instrucoes
newTrial("instructions",
    newText("instructions_greeting", "<h2>INSTRUÇÕES</h2><p>Neste experimento, você deverá dar notas para algumas frases de acordo com o uso que fazemos da língua no dia a dia.</p><p>Ao iniciar, leia a frase que aparece na tela e atribua a ela uma nota, movimentando o cursor na escala de 0 (totalmente não aceitável) a 100 (totalmente aceitável) até a nota desejada.</p><p>Então clique em CONTINUAR e responda a uma breve pergunta que aparece depois sobre a frase, sem pensar demais na resposta. Apenas siga o sentido que tiver vindo primeiro na sua cabeça.</p><p>Por fim, clique em PRÓXIMO para continuar avaliando as próximas frases.</p><p>Se você entendeu essas instruções, clique em INICIAR para começar.</p>")
        .left()
        .cssContainer({"margin":"1em"})
        .print()
        ,
    
    newButton("go_to_exercise", "Iniciar experimento")
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        .wait()
)

// Treinamento
Template("exercise.csv", row =>
    newTrial( "exercise" ,
        newText("sentence", row.SENTENCE)
            .cssContainer({"margin-top":"2em", "margin-bottom":"2em", "font-size":"1.55em"})
            .center()
            .print()
            ,

    newScale("slider", 100)
        .before( newText("left", "<div class='fancy'> TOTALMENTE NÃO ACEITÁVEL (0) </div>") )
        .after( newText("right", "<div class='fancy'> (100) TOTALMENTE ACEITÁVEL </div>") )
        .labelsPosition("top")
        .cssContainer({"margin":"1em"})
        .slider()
        .center()
        .size(500).css("max-width", "20em")
        .print()
        ,
    
    newText(`<span style='width: 2em; text-align: left;'>0</span>
        <span style='width: 2em; text-align: center;'>25</span>
           <span style='width: 2em; text-align: center;'>50</span>
           <span style='width: 2em; text-align: center;'>75</span>
           <span style='width: 2em; text-align: right;'>100</span>`)
    .css({display: 'flex', 'justify-content': 'space-between', width: '20em'})
    .center()
    .print()
    	,
	     
        newButton("go_to_exercise", "Continuar")
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        .wait()
        ,
        newTimer("wait", 800)
            .start()
            .wait()
        , 
        clear()
        ,
        newText("comprehension", "Qual opção descreve melhor a interpretação dessa sentença (mesmo que essa interpretação pareça estranha)?")
            .cssContainer({"margin-top":"1em", "margin-bottom":"1em", "font-size":"1.55em"})
            .center()
            .print()
        ,
        newScale("answers", row.ANSWER1, row.ANSWER2)
        .radio()
        .vertical()
        .labelsPosition("right")
        .cssContainer({"margin-top":"1em", "margin-bottom":"1em", "font-size":"1.2em", "line-height": "5em"})
        .print()
        .wait()
        ,
        newButton("nextbutton", "Próximo")
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        .wait()
))

// Comecar experimento
newTrial( "start_experiment" ,

// Experimento

Template("experiment.csv", row =>
    newTrial( "experiment-"+row.TYPE,
        newText("sentence", row.SENTENCE)
            .cssContainer({"margin-top":"2em", "margin-bottom":"2em", "font-size":"1.2em"})
            .center()
            .print()
            ,
	     
    newScale("slider", 100)
        .before( newText("left", "<div class='fancy'> TOTALMENTE NÃO ACEITÁVEL (0) </div>") )
        .after( newText("right", "<div class='fancy'> (100) TOTALMENTE ACEITÁVEL </div>") )
        .labelsPosition("top")
        .cssContainer({"margin":"1em"})
        .slider()
        .center()
        .size(500).css("max-width", "20em")
        .print()
        .log("last")
        ,
        
    newText(`<span style='width: 2em; text-align: left;'>0</span>
        <span style='width: 2em; text-align: center;'>25</span>
           <span style='width: 2em; text-align: center;'>50</span>
           <span style='width: 2em; text-align: center;'>75</span>
           <span style='width: 2em; text-align: right;'>100</span>`)
    .css({display: 'flex', 'justify-content': 'space-between', width: '20em'})
    .center()
    .print()
    ,
    newButton("go_to_exercise", "Continuar")
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        .wait()
        ,
        newTimer("wait", 800)
            .start()
            .wait()
        , 
    clear()
    ,
    newText("comprehension", "Qual opção descreve melhor a interpretação dessa sentença (mesmo que essa interpretação pareça estranha)?")
            .cssContainer({"margin-top":"1em", "margin-bottom":"1em", "font-size":"1.55em"})
            .center()
            .print()
        ,
	newVar("CORRECT").global().set(false)
	,
        newScale("answers", row.ANSWER1, row.ANSWER2)
        .radio()
        .vertical()
        .labelsPosition("right")
        .cssContainer({"margin-top":"1em", "margin-bottom":"1em", "font-size":"1.2em", "line-height": "5em"})
        .print()
        .wait()
	.test.selected(row.INTENDEDMEANING).success( getVar("CORRECT").set(true) )
        .log("last")
        ,
        newButton("go_to_exercise", "Próximo")
        .cssContainer({"margin":"1em"})
        .center()
        .print()
        .wait()
	,
        clear()
        ,
        // Wait briefly to display which option was selected
        newTimer("wait", 800)
            .start()
            .wait()
    )
    
    // Record trial data
    .log("ITEM"     , row.ITEM)
    .log("SENTENCE"   , row.SENTENCE)
    .log("CORRECT", getVar("CORRECT"))
))

// Final screen, thanks
newTrial("end",
    newText("<div class='fancy'><h2>Obrigado pela participação!</h2></div><p>Você pode fechar esta janela agora.")
        .cssContainer({"margin-top":"1em", "margin-bottom":"1em"})
        .print()
    ,
    // Trick: stay on this trial forever (until tab is closed)
    newButton().wait()
)
.setOption("countsForProgressBar",false);
