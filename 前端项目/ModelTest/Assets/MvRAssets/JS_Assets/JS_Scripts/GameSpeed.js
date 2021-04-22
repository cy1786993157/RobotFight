//This script allows you to set several speeds for the game, and scroll through them with buttons. It also has a pause button and a back-to-menu button.
#pragma strict

import UnityEngine.UI;

//Should we use the old Unity OnGUI instead of the new Unity (4.6+) UI
var useOldUI:boolean = false;

//The canvas for the game elements in the new UI (4.6+)
var buildMenuCanvas:Transform;
var gameMenuCanvas:Transform;
var speedMenuCanvas:Transform;

//Global game speed
var gameSpeeds:float[];
private var currentSpeed:int = 0;

internal var isPaused:boolean = false;

function Start() 
{
	//Deactivate the new UI menu elements at the start of the game
	if ( gameMenuCanvas )    gameMenuCanvas.gameObject.SetActive(false);
	
	Time.timeScale = gameSpeeds[currentSpeed];
}

var guiSkin:GUISkin;

var offset:Vector2;

function OnGUI()
{
	GUI.skin = guiSkin;
	
	if ( useOldUI == true )
	{
		if ( gameSpeeds.Length > 0 )
		{
			//Create a label for the game's current speed. Note that setting the game to very high speeds will result in hit detection problems
			GUI.Box( Rect(Screen.width * 0.5 + offset.x, Screen.height - 30 + offset.y, 40, 25), gameSpeeds[currentSpeed].ToString() + "X");
			
			//If we press the speed up button, increase the speed to the next tier
			if ( GUI.Button(Rect(Screen.width * 0.5 + 40 + offset.x, Screen.height - 32 + offset.y, 40, 30), ">>") )
		    {
				NextSpeed();
		    }
		    
		    //If we press the speed down button, decrease the speed to the previous tier
		    if ( GUI.Button(Rect(Screen.width * 0.5 - 80 + offset.x, Screen.height - 32 + offset.y, 40, 30), "<<") )
		    {
				PreviousSpeed();
		    }
		}
	    
	    //If we press the pause button, stop the game and display a menu
		if ( GUI.Button(Rect(Screen.width * 0.5 + offset.x - 40, Screen.height - 32 + offset.y, 40, 30), "ll") )
	    {
	    	Pause();
	    }
	}
}

//A function that pauses gameplay, and deactivates in-game menu items
function Pause()
{
	isPaused = true;
	    	
	Time.timeScale = 0;
	
	//Enable all other components in this game controller object
	if ( GetComponent(BuildController) )    GetComponent(BuildController).enabled = false;
	if ( GetComponent(EnemyDispenser) )    GetComponent(EnemyDispenser).enabled = false;
	if ( GetComponent(GameSpeed) )    GetComponent(GameSpeed).enabled = false;
	
	//If we are using the old UI, activate the OnGUI game menu
	if ( GetComponent(GameMenu) && useOldUI == true )    GetComponent(GameMenu).enabled = true;
	
	//If we have a game menu canvas for the new UI (4.6+), activate it
	if ( useOldUI == false )
	{
		if ( gameMenuCanvas )    gameMenuCanvas.gameObject.SetActive(true);
		if ( speedMenuCanvas )    speedMenuCanvas.gameObject.SetActive(false);
		if ( buildMenuCanvas )    buildMenuCanvas.gameObject.SetActive(false);
	}
}

//A function that resumes gameplay, and reactivates in-game menu items
function Resume()
{
	isPaused = false;
	
	if ( gameSpeeds.Length > 0 )
	{
		Time.timeScale = gameSpeeds[currentSpeed];
	}
	else
	{
		Time.timeScale = 1;
	}
	
	//Enable all other components in this game controller object
	if ( GetComponent(BuildController) )    GetComponent(BuildController).enabled = true;
	if ( GetComponent(EnemyDispenser) )    GetComponent(EnemyDispenser).enabled = true;
	if ( GetComponent(GameSpeed) )    GetComponent(GameSpeed).enabled = true;
	
	//Disable the in-game menu
	if ( GetComponent(GameMenu) )    GetComponent(GameMenu).enabled = false;
	
	//If we have a game menu canvas for the new UI (4.6+), deactivate it
	if ( useOldUI == false )
	{
		if ( gameMenuCanvas )    gameMenuCanvas.gameObject.SetActive(false);
		if ( speedMenuCanvas )    speedMenuCanvas.gameObject.SetActive(true);
		if ( buildMenuCanvas )    buildMenuCanvas.gameObject.SetActive(true);
	}
}

//This function changes the speed to the next speed level
function NextSpeed()
{
	if ( currentSpeed < gameSpeeds.Length - 1 )
	{
		currentSpeed++;
		
		Time.timeScale = gameSpeeds[currentSpeed];
		
		if ( speedMenuCanvas )    speedMenuCanvas.Find("MenuButtons/GameSpeed/Text").GetComponent(Text).text = gameSpeeds[currentSpeed].ToString() + "X";
	}
}

//This function changes the speed to the previous speed level
function PreviousSpeed()
{
	if ( currentSpeed > 0 )
	{
		currentSpeed--;
		
		Time.timeScale = gameSpeeds[currentSpeed];
		
		if ( speedMenuCanvas )    speedMenuCanvas.Find("MenuButtons/GameSpeed/Text").GetComponent(Text).text = gameSpeeds[currentSpeed].ToString() + "X";
	}
}

