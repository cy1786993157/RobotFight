//This script displays a simple description within a defined size and position. This GUI element is very primitive  and is not recommended for your full project.
//Instead you should consider using a more robust and advanced GUI system than what is available natively in Unity (21/8/2013) such as EZGUI or NGUI.

#pragma strict

//@script ExecuteInEditMode

var positionAndSize:Rect = Rect( 100, 100, 600, 400);

//Tha actual text description to be displayed
var description:String;

var guiSkin:GUISkin;

function OnGUI()
{
	GUI.skin = guiSkin;

	GUI.Label( positionAndSize, description);
	
	//A button which goes bacck to the start menu
	if ( GUI.Button( Rect( (Screen.width - 300) * 0.5, Screen.height - 60, 300, 50), "Back To Menu") )
	{
		if ( audio ) audio.Play();
		
		Application.LoadLevel("StartMenu");
	}
	
	GUI.Label( positionAndSize, "" ); 
}