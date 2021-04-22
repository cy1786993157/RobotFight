//This script lists all the units avaialable in the game, and allows the player to choose which ones to take into battle. You can set the maximum number of
//allowed units in the battle, and wether a unit is essential to this battle. This script should be attached to the BuildController object along with other 
//relevant scripts such as BuildController, EnemyDispenser, GameSpeed, etc.

#pragma strict

import UnityEngine.UI;

//@script ExecuteInEditMode

//Should we use the old Unity OnGUI instead of the new Unity (4.6+) UI
var useOldUI:boolean = false;

//The canvas for the unit selection menu in the new UI (4.6+)
var unitSelectionCanvas:Transform;

//Maximum allowed units
var maxUnits:int = 5;

//How many units are selected 
private var selectedUnits:int = 0;

//This variable set a unit object and wether its essential in the current level
var allUnits:AllUnits[];

class AllUnits 
{
    var unit:Transform;
    var essential:boolean = false;
}

//A list of the buttons of the units we can build
var buildListButtons:Transform[];

//A list of buttons of all the units in the grid
var gridButtons:Transform[];

//A list of the units that can be deployed in this battle
internal var buildList:Transform[];

function Start()
{
	//Go through all the resource types the player has and deactivate their new UI (4.6+) icons
	for ( var resourceIndex:int = 0 ; resourceIndex < GetComponent(BuildController).moneyTypes.length ; resourceIndex++ )
	{
		//Disable the icon of the resource type
		if ( GetComponent(BuildController).moneyTypes[resourceIndex].icon )    GetComponent(BuildController).moneyTypes[resourceIndex].icon.gameObject.SetActive(false);
	}
	
	//If we are using the old GUI, deactivate the new UI canvas
	if ( useOldUI == true && unitSelectionCanvas )    unitSelectionCanvas.gameObject.SetActive(false);
	
	//Deactivate the speed menu canvas, because we need to select units for the battle first
	if ( GetComponent(GameSpeed).speedMenuCanvas )    GetComponent(GameSpeed).speedMenuCanvas.gameObject.SetActive(false);
	
	//Deactivate the build menu canvas, because we need to select units for the battle first
	if ( GetComponent(BuildController).buildMenuCanvas )    GetComponent(BuildController).buildMenuCanvas.gameObject.SetActive(false);
	
	//Deactivate the enemy canvas, because we need to select units for the battle first
	if ( GetComponent(EnemyDispenser).enemyCanvas )    GetComponent(EnemyDispenser).enemyCanvas.gameObject.SetActive(false);
	
	//If we are using the old UI, limit the value of Max Units based on the number of slots in the build list ( new UI )
	if ( useOldUI == false )    
	{
		if ( maxUnits > buildListButtons.Length  )    maxUnits = buildListButtons.Length;
	
		//Remove any extra slots in the build list
		for ( var index:int = maxUnits ; index < buildListButtons.Length ; index++ )
		{
			//Make the button of the building in the build list unclickable
			//buildListButtons[index].GetComponent(Button).interactable = false;
			
			//Disable the whole building slot
			//buildListButtons[index].Find("Icon").gameObject.SetActive(false);
			
			//Disable the whole building slot
			buildListButtons[index].gameObject.SetActive(false);
		}
	}
	
	//Pause the game
	Time.timeScale  = 0;
	
	//Calculate the size of a single tile within the grid of units
	tileSize.x = positionAndSize.width/grid.x;
	tileSize.y = positionAndSize.height/grid.y;
	
	//Disable all other components in this game controller object
	if ( GetComponent(BuildController) )    GetComponent(BuildController).enabled = false;
	if ( GetComponent(EnemyDispenser) )    GetComponent(EnemyDispenser).enabled = false;
	if ( GetComponent(GameSpeed) )    GetComponent(GameSpeed).enabled = false;
	if ( GetComponent(GameMenu) )    GetComponent(GameMenu).enabled = false;
	
	//Set the build list in the BuildController script to be the same length as maxUnits
	GetComponent(BuildController).buildList = new Transform[maxUnits];
	
	//Register the build list transform array for easier access
	buildList = GetComponent(BuildController).buildList;
	
	//Set the units which are essential to this battle
	SetEssential();
	
	//Set the icons of the units in the grid
	SetGrid();
}

var guiSkin:GUISkin;

//A grid of UI tiles for the units
var grid:Vector2 = Vector2(4,2);

//The overall position and size of the grid
var positionAndSize:Rect = Rect();

//The size of each tile is calculated automaticall in Start()
private var tileSize:Vector2 = Vector2();

//General use index variables
private var indexA:int = 0;
private var indexB:int = 0;
private var indexC:int = 0;

//The size of a button in the build list
var buttonSize:Vector2 = Vector2(70, 70);

function OnGUI()
{
	GUI.skin = guiSkin;
	
	if ( useOldUI == true )
	{
		//Build a list of buttons for the units selected for battle
		for ( indexA = 0 ;  indexA < buildList.length ; indexA++ )
	    {
	   	   if ( indexA < maxUnits )
	   	   {
		   	   if ( !buildList[indexA] )
		   	   {
		   	       //If there is no unit at this tile, keep it empty
		   	       GUI.Box(Rect( indexA * buttonSize.x, 0, buttonSize.x, buttonSize.y), "");
		   	   }
		   	   else if ( GUI.Button(Rect( indexA * buttonSize.x, 0, buttonSize.x, buttonSize.y), buildList[indexA].GetComponent(Building).icon) )
		   	   {
		   	       //If there is a unit on this tile, and it's not essential, remove it from the list of units to be used in this battle
		   	       if ( allUnits[buildList[indexA].GetComponent(Building).listIndex].essential == false )
		   	       {
			   	       if ( audio )    audio.Play();
			   	       
			   	       //Asign the unit from the unit battle list back to the unit selection grid
			   	       allUnits[buildList[indexA].GetComponent(Building).listIndex].unit = buildList[indexA];
			   	       
			   	       //Clear the unit from the unit battle list
			   	       buildList[indexA] = null;
					   
			   	       selectedUnits--;
		   	       }
		   	   }
	   	   }
	   	}
		
		GUI.Label( Rect( (Screen.width - 400) * 0.5, positionAndSize.y - 30, 400, 50), Application.loadedLevelName + " - SELECT YOUR UNITS");
		
		//Build a grid of buttons for the selectable units
		for ( indexA = 0 ; indexA < grid.y ; indexA++ )
		{
			for ( indexB = 0 ; indexB < grid.x ; indexB++ )
			{
				if ( indexC < allUnits.Length )
				{
					if ( allUnits[indexC].unit )
					{
						//If there is a unit on this tile, add it to the list of units to be used in this battle
						if ( GUI.Button( Rect( positionAndSize.x + indexB * tileSize.x, positionAndSize.y + indexA * tileSize.y, tileSize.x, tileSize.y), allUnits[indexC].unit.GetComponent(Building).icon) )
						{
							//Go through the tiles in the unit list, and add the selected unit to the next empty slot
							for ( var unitIndex:int = 0; unitIndex < buildList.Length ; unitIndex++ )
							{
								if ( buildList[unitIndex] == null && allUnits[indexC].unit )
								{
									if ( audio )    audio.Play();
									
									AddUnit(indexC);
								}
							}	
						}
					}
					else
					{
						//If there is no unit in this slot, keep it empty
						GUI.Box( Rect( positionAndSize.x + indexB * tileSize.x, positionAndSize.y + indexA * tileSize.y, tileSize.x, tileSize.y), "");
					}
				}
				else
				{
					//If there is no unit in this slot, keep it empty
					GUI.Box( Rect( positionAndSize.x + indexB * tileSize.x, positionAndSize.y + indexA * tileSize.y, tileSize.x, tileSize.y), "");
				}
				
				indexC++;
			}
		}
		
		indexC = 0;
		
		//A "ready to begin" button
		if ( GUI.Button( Rect( (Screen.width - 300) * 0.5, positionAndSize.y + indexA * tileSize.y, 300, 50), "Ready To Begin!") )
		{
			StartGame();
		}
		
		//This button returns to the main menu
		if ( GUI.Button( Rect( (Screen.width - 300) * 0.5, Screen.height - 60, 300, 50), "Back To Menu") )
		{
			if ( audio )    audio.Play();
			
			Application.LoadLevel("StartMenu");
		}
	}
}

//This function sets the essential units, which are automatically added to the unit battle list, and cannot be removed from it
function SetEssential()
{
	for ( indexA = 0 ; indexA < grid.y ; indexA++ )
	{
		for ( indexB = 0 ; indexB < grid.x ; indexB++ )
		{
			if ( indexC < allUnits.Length )
			{
				if ( allUnits[indexC].unit )
				{
					if ( allUnits[indexC].essential == true )
					{
						//Go through the tiles in the unit list, and add the selected unit to the next empty slot
						for ( var unitIndex:int = 0; unitIndex < buildList.Length ; unitIndex++ )
						{
							if ( buildList[unitIndex] == null && allUnits[indexC].unit )
							{
								AddUnit(indexC);
							}
						}	
					}
				}
			}
			
			indexC++;
		}
	}
	
	indexC = 0;
	
	if ( useOldUI == false )
	{
		//Go through the buildlist and make all buttons unclickable
		for ( indexA = 0 ; indexA < buildList.Length ; indexA++ )
		{
			//Make the button of the building in the build list unclickable
			buildListButtons[indexA].GetComponent(Button).interactable = false;
			
			//If the button has no building in it, disable the icon of the building in the build list
			if ( buildList[indexA] == null )    buildListButtons[indexA].Find("Icon").GetComponent(Image).enabled = false;
		}
	}
}

//This function adds a unit to the next available slot in the build list for the current match
function AddUnit( gridIndex:int )
{
	//Find the next empty slot in the build list, and add this unit from the grid to it
	for ( var buildingIndex:int = 0 ; buildingIndex < buildList.Length ; buildingIndex++ )
	{
		if ( buildList[buildingIndex] == null && allUnits[gridIndex].unit )
		{
			//Set this unit as the selected
			buildList[buildingIndex] = allUnits[gridIndex].unit;
			
			//Record the index of this unit in the Building script
			buildList[buildingIndex].GetComponent(Building).listIndex = gridIndex;
			
			if ( useOldUI == false )
			{
				//Make the button of the building in the build list clickable
				buildListButtons[buildingIndex].GetComponent(Button).interactable = true;
				
				//Enable the icon of the building
				buildListButtons[buildingIndex].Find("Icon").GetComponent(Image).enabled = true;
					
				//Add the icon of the building
				buildListButtons[buildingIndex].Find("Icon").GetComponent(Image).sprite = Sprite.Create(allUnits[gridIndex].unit.GetComponent(Building).icon , Rect( 0, 0,allUnits[gridIndex].unit.GetComponent(Building).icon.width, allUnits[gridIndex].unit.GetComponent(Building).icon.height), Vector2(0.5f, 0.5f));
				
				//Make the button of the building in the grid unclickable
				gridButtons[gridIndex].GetComponent(Button).interactable = false;
			
				//Disable the icon of the building
				gridButtons[gridIndex].Find("Icon").GetComponent(Image).enabled = false;
			}
			
			//Clear the unit
			allUnits[gridIndex].unit = null;
			
			//Increase the number of selected units
			selectedUnits++;
			
			return;
		}
	}
}

//This function adds a unit to the next available slot in the build list for the current match
function RemoveUnit( unitIndex:int )
{
	//If there is a unit on this tile, and it's not essential, remove it from the list of units to be used in this battle
	if (  buildList[unitIndex] )
	{
		if ( allUnits[buildList[unitIndex].GetComponent(Building).listIndex].essential == false )
		{
		      if ( audio )    audio.Play();
		      
		      //Asign the unit from the unit battle list back to the unit selection grid
		      allUnits[buildList[unitIndex].GetComponent(Building).listIndex].unit = buildList[unitIndex];
		      
		      //Make the button of the building in the build list unclickable
			  buildListButtons[unitIndex].GetComponent(Button).interactable = false;
		      
		      //Disable the icon of the building in the build list
			  buildListButtons[unitIndex].Find("Icon").GetComponent(Image).enabled = false;
			  
			  //Make the button of the building in the grid clickable
			  gridButtons[buildList[unitIndex].GetComponent(Building).listIndex].GetComponent(Button).interactable = true;
			  
			  //Enable the icon of the building in the grid
			  gridButtons[buildList[unitIndex].GetComponent(Building).listIndex].Find("Icon").GetComponent(Image).enabled = true;
		      
		      //Clear the unit from the unit battle list
		      buildList[unitIndex] = null;
		      
		      //Decrease the number of selected units
			  selectedUnits--;
		}
	}
}


function SetGrid()
{
	//Build a list of buttons for the units selected for battle
	for ( indexA = 0 ;  indexA < gridButtons.length ; indexA++ )
    {
		//If there is a unit on this tile, and it's not essential, place it in the grid and not in the list of units to be used in battle
		if ( indexA < allUnits.Length && allUnits[indexA].essential == false )
		{
			//Enable the icon of the building
			gridButtons[indexA].Find("Icon").GetComponent(Image).enabled = true;
			
			//Add the icon of the building
			gridButtons[indexA].Find("Icon").GetComponent(Image).sprite = Sprite.Create(allUnits[indexA].unit.GetComponent(Building).icon , Rect( 0, 0,allUnits[indexA].unit.GetComponent(Building).icon.width, allUnits[indexA].unit.GetComponent(Building).icon.height), Vector2(0.5f, 0.5f));
		}
		else
		{
			//Make the button of the building in the build list unclickable
			gridButtons[indexA].GetComponent(Button).interactable = false;
			  
			//Disable the icon of the building
			gridButtons[indexA].Find("Icon").GetComponent(Image).enabled = false;
		}
   	}
}

//This function ends the unit selection phase, and starts the game
function StartGame()
{
	//If we have at least one selected unit, start the game
	if ( selectedUnits > 0 )
	{
		//Unpause the game
		Time.timeScale  = 1;
		
		if ( audio )    audio.Play();
		
		//Enable all other components in this game controller object
		if ( GetComponent(BuildController) )    GetComponent(BuildController).enabled = true;
		if ( GetComponent(EnemyDispenser) )    GetComponent(EnemyDispenser).enabled = true;
		if ( GetComponent(GameSpeed) )    GetComponent(GameSpeed).enabled = true;
		
		//Assign the correct cooldown for each unit in the list
		GetComponent(BuildController).GetCooldowns();
		
		//Deactivate the unit selection canvas
		if ( unitSelectionCanvas )    unitSelectionCanvas.gameObject.SetActive(false);
		
		//If we are using the new GUI (4.6+), activate the build menu canvas and set the build list for it
		if ( useOldUI == false )
		{
			//If we have a speed menu canvas assigned, activate it
			if ( GetComponent(GameSpeed).speedMenuCanvas )    GetComponent(GameSpeed).speedMenuCanvas.gameObject.SetActive(true);
					
			//If we have a build menu canvas assigned, activate it
			if ( GetComponent(BuildController).buildMenuCanvas )    GetComponent(BuildController).buildMenuCanvas.gameObject.SetActive(true);
			
			//If we have an enemy canvas assigned, activate it
			if ( GetComponent(EnemyDispenser).enemyCanvas )    GetComponent(EnemyDispenser).enemyCanvas.gameObject.SetActive(true);
			
			//Set the build list icons in the build controller
			GetComponent(BuildController).SetBuildList();
			
			//If we have a game speed canvas assigned, activate it
			if ( GetComponent(GameSpeed) )    if ( GetComponent(GameSpeed).speedMenuCanvas )    GetComponent(GameSpeed).speedMenuCanvas.gameObject.SetActive(true);
			
			//Go through all the resource types the player has and activate their new UI (4.6+) icons
			for ( var resourceIndex:int = 0 ; resourceIndex < GetComponent(BuildController).moneyTypes.length ; resourceIndex++ )
			{
				//Activate the icon of the resource type
				GetComponent(BuildController).moneyTypes[resourceIndex].icon.gameObject.SetActive(true);
			}
		}
		
		//Disable this script
		this.enabled = false;
	}
}


