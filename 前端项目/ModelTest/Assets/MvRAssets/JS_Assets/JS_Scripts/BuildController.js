/*This script includes the player's money and a list of buildings you can buy. It lists the buildings in a menu with their names and prices, and allows 
the player to click on one and place it on a valid tile. The price is reduced and the cooldown timer is set based on the building stats.*/

#pragma strict

import UnityEngine.UI;
import UnityEngine.EventSystems;

//@script ExecuteInEditMode

//Should we use the old Unity OnGUI instead of the new Unity (4.6+) UI
var useOldUI:boolean = false;

//The pointer that is used to place buildings when using a keyboard or a gamepad
internal var pointer:Transform;
var pointerSpeed:float = 10;

//The area within which the pointer can move
var pointerMoveArea:Rect = Rect(1.5,-0.5,10.5,5.5);

//Is the mouse being used now?
internal var mouseControls:boolean = false;

//The canvas for the build menu in the new UI (4.6+)
var buildMenuCanvas:Transform;

//Caching the transform for quicker access
private var thisTransform:Transform;

//A general use index
private var index:int;

//A list of all the resources the player can collect
var moneyTypes:MoneyType[];

class MoneyType
{
	var moneyObject:Transform;
	var amount:int;
	var icon:Transform;
}

//Player money
var money:int = 100;

//A list of the buildings we can place
var buildList:Transform[];

//A list of the buttons of the units we can build
var buildListButtons:Transform[];

//The current selected building and its index
internal var currentBuild:Transform;
internal var currentIndex:int;

//The cooldown for each building
private var cooldown:float[];
private var cooldownCount:float[];

//Error check when we place the building on a tile
internal var error:boolean = false;
var errorIcon:Texture2D;

//Sell button for selling buildings we already placed on a tile
internal var sell:boolean = false;
var sellIcon:Texture2D;

var sellValue:float = 1;

//A general raycast for hit detection
var hit:RaycastHit;

var soundBuild:AudioClip;
var soundSell:AudioClip;

//Should the tooltip be shown now?
var showTooltip:boolean = false;

//The text that should be displayed in the tooltip
var tooltipText:String = "Tooltip";

function Start()
{
	//Create a new pointer transform, which can be controlled by either the mouse or the keyboard/gamepad
	pointer = new GameObject().transform;	
	pointer.name = "Pointer";
	pointer.position = Vector3(-10,5,5);
	mouseControls = false;
	
	//If we are using the old GUI, deactivate the new UI canvas 
	if ( useOldUI == true )    
	{
		//Go through all the resource types the player has and deactivate their new UI (4.6+) icons
		for ( var resourceIndex:int = 0 ; resourceIndex < moneyTypes.length ; resourceIndex++ )
		{
			//Disable the icon of the resource type
			if ( moneyTypes[resourceIndex].icon )    moneyTypes[resourceIndex].icon.gameObject.SetActive(false);
		}
	}
	else
	{
		if ( buildMenuCanvas )    buildMenuCanvas.gameObject.SetActive(false);
		
		//If we are using the new UI (4.6+), set the build list for the buttons of the new UI
		ClearBuildList();
		
		//If we don't have a unit selection script, set the build list from this script
		if ( !GetComponent(UnitSelection) )    SetBuildList(); 
		if ( GetComponent(UnitSelection).enabled == false )    SetBuildList(); 
	}
	
	thisTransform = transform; //Caching transform for quicker access
	
	//Disable the menu component
	if ( GetComponent(GameMenu) )    GetComponent(GameMenu).enabled = false;
	
	GetCooldowns();
}

function Update() 
{
	//If mouse movement is detected, then the mouse controls are activated
	if ( Input.GetAxis("Mouse X") || Input.GetAxis("Mouse Y") )    mouseControls = true;
	
	//If mouse movement is detected, then the mouse controls are activated
	if ( Input.GetAxis("Horizontal") || Input.GetAxis("Vertical") )    mouseControls = false;
	
	if ( mouseControls == true )
	{
		pointer.position = Camera.main.ScreenToWorldPoint(Input.mousePosition);
		
		pointer.position.y = 5;
	}
	else if ( EventSystem.current.sendNavigationEvents == false )
	{
		//Move the pointer with the keyboard/gamepad
		pointer.position.z += Input.GetAxis("Horizontal") * pointerSpeed * Time.deltaTime;
		pointer.position.x += Input.GetAxis("Vertical") * -pointerSpeed * Time.deltaTime;
		
		//Limit the position of the pointer to the move area
		if ( pointer.position.z < pointerMoveArea.x )    pointer.position.z = pointerMoveArea.x;
		if ( pointer.position.z > pointerMoveArea.width )    pointer.position.z = pointerMoveArea.width; 
		if ( pointer.position.x < pointerMoveArea.y )    pointer.position.x = pointerMoveArea.y;
		if ( pointer.position.x > pointerMoveArea.height )    pointer.position.x = pointerMoveArea.height; 
	}
	
	//Display the building cooldowns when using the new UI
	if ( useOldUI == false )
	{ 
		//Go through all the buildings in the build list
		for ( index = 0 ; index < buildListButtons.Length ; index++ )
		{
			if ( buildListButtons[index] && buildListButtons[index].GetComponent(Button).interactable == true )
			{
				if ( buildList[index] )
				{
					if ( cooldown[index] )
					{
						//Only display the cooldown if it's more than 0
						if ( cooldownCount[index] < cooldown[index] )   
						{
							//Display the cooldown circle wipe based on the cooldown time left
						    buildListButtons[index].Find("Cooldown").GetComponent(Image).fillAmount = 1 - (cooldownCount[index]/cooldown[index]);
						}
						else if ( cooldownCount[index] != cooldown[index] )
						{
							cooldownCount[index] = cooldown[index];
							
							buildListButtons[index].Find("Cooldown").GetComponent(Image).fillAmount = 0;
						}
					}
				}
			}
		}
		
		//Go through all the resource types the player has
		for ( var resourceIndex:int = 0 ; resourceIndex < moneyTypes.length ; resourceIndex++ )
		{
			//Display how much money we have for this resource type
			if ( moneyTypes[resourceIndex].icon )    moneyTypes[resourceIndex].icon.Find("Text").GetComponent(Text).text = moneyTypes[resourceIndex].amount.ToString();
		}
	}

	//If we have the sell button active and we click the Right Mouse Button, cancel the sell action
	if ( Input.GetButtonDown("Fire2") && sell == true )
	{
		sell = false; //Clear the sell button
		
		//Start responding to navigation events ( for 4.6+ UI )
		if ( useOldUI == false )    EventSystem.current.sendNavigationEvents = true;
	}
	
	//If we have a building selected, allow the player to try to place it on a tile. If there are no placing errors put the building on the tile and activate it
	if ( currentBuild )
	{
		//Try to place the current building on the tiles
		PlaceBuilding();
		
		//If we have a selected building and we click Right Mouse Button, remove it
		if ( Input.GetButtonDown("Fire2") && currentBuild )
		{
			error = false; //There is no error
			
			//Start responding to navigation events ( for 4.6+ UI )
			if ( useOldUI == false )    EventSystem.current.sendNavigationEvents = true;
			
			Destroy(currentBuild.gameObject);
		}
	}
	
	//Create a raycast from the camera to the mouse position and check collision with money objects
	if ( Physics.Raycast( pointer.position, -Vector3.up, hit, 100) ) 
    {
        if ( hit.collider.tag == "Money" )
        {
	        if ( hit.collider.GetComponent(Money).resourceName != "" && moneyTypes.length > 0 )
			{
				CheckResourceList(hit.collider.GetComponent(Money).resourceName, -hit.collider.GetComponent(Money).money, true);
			}
			else
			{
				money += hit.collider.GetComponent(Money).money;
			}
			
			if ( hit.collider.GetComponent(Money).soundPickup )    audio.PlayOneShot(hit.collider.GetComponent(Money).soundPickup);
			
	        hit.collider.GetComponent(Money).pickedUp = true;
	    }
	    
	    if ( sell )
	    {
		    if ( hit.collider.GetComponent(Building) )
		    {
			    if ( Input.GetButtonDown("Fire1") )
		        {
		           if ( soundSell )    audio.PlayOneShot(soundSell);
		           
		           if ( hit.collider.GetComponent(Building).moneyCosts.length > 0 && moneyTypes.length > 0 )
				   {
					   for ( var resourceCost in hit.collider.GetComponent(Building).moneyCosts )
					   {
						   CheckResourceList(resourceCost.moneyObject.GetComponent(Money).resourceName, resourceCost.moneyObject.GetComponent(Money).money * -sellValue, true);
					   }
				   }
				   else
				   {
	        		   //Add to the player's money based on the sell value of the building
	        		   money += hit.collider.GetComponent(Building).price * sellValue;
	        	   }
		           
		           //Destroy the sold building 
	   	           Destroy(hit.collider.gameObject);
	   	           
	   	           //sell = false;
	        	}
		    }
		}
	}
	
	//Go through all the buildings in the build list
	for ( index = 0 ;  index < buildList.length ; index++ )
	{
	   //Count only for available buildings
	   if ( buildList[index] )
	   {
			//Count up the cooldown timer for each building
			if ( cooldownCount[index] < cooldown[index] )   
			{
			   //Counting up
			   cooldownCount[index] += Time.deltaTime;
			}
		}
	}
	
	//Displaying a tooltip with unit description
	if ( useOldUI == true )
	{
		//Go through the build list
		for ( index = 0 ;  index < buildList.length ; index++ )
	    {
	   	   if ( buildList[index] )
	   	   {
		       //Check the position of the unit icon
		       var rect = Rect( index * buttonSize.x, Screen.height - buttonSize.y, buttonSize.x, buttonSize.y);
				
			   //If the mouse is over the unit icon, show the tooltip
			   if ( rect.Contains(Input.mousePosition) )
			   {
			       showTooltip = true;
			       
			       //Get the description of the unit from the building itself
			       tooltipText = buildList[index].GetComponent(Building).description;
			       
			       break;
			   }
			   
			   //If the mouse is not over any of the units in the build list, remove the tooltips
			   showTooltip = false;
		   	}
		 }
	}
}

function GetCooldowns()
{
	//Set the cooldown arrays to the same length as the build list array
	cooldown = new float[buildList.Length];
	cooldownCount = new float[buildList.Length];
	
	for ( index = 0 ; index < cooldownCount.Length ; index++ )
	{
		//Set the cooldown for each building in the list
		if ( buildList[index] )    cooldown[index] = cooldownCount[index] = buildList[index].GetComponent(Building).coolDown;
	}
}

//This function checks if we have enough of a resource, and returns true/false
function CheckResourceList( name:String, amount:int, updateAmount:boolean ):boolean
{
	//The value we will return, true or false
	var checkResult:boolean = false;
	
	//Go through all the resource the player has
	for ( var resource in moneyTypes )
	{
		//First check is for the name of the resource
		if ( resource.moneyObject.GetComponent(Money).resourceName == name )
		{
			//Second check is to see if we have enough of that resource
			if ( resource.amount - amount >= 0 )
			{
				checkResult = true;
				
				//If this is true, the value of the resource is updated, adding to it or substracting from it
				if ( updateAmount == true )
				{
					resource.amount -= amount;
				}
			}
		}
	}
	
	//Return the value
	return checkResult;
}

var guiSkin:GUISkin;

//The size of a button in the build list
var buttonSize:Vector2 = Vector2(70, 70);

//The icon for the money label
var moneyIcon:Texture2D;

//The size of the resource bars
var moneyIconSize:Vector2 = Vector2(120,64);

function OnGUI()
{
	GUI.skin = guiSkin;
	
	if ( useOldUI == true )
	{
		if ( moneyTypes.length > 0 )
		{
			//Go through all the resource types the player has
			for ( var resourceIndex:int = 0 ; resourceIndex < moneyTypes.length ; resourceIndex++ )
			{
				//Set the background of the money gui style
				GUI.skin.GetStyle("Money").normal.background = moneyTypes[resourceIndex].moneyObject.GetComponent(Money).iconBig;
			
				//Display how much money we have
				GUI.Label( Rect( resourceIndex * moneyIconSize.x, Screen.height - moneyIconSize.y, moneyIconSize.x, moneyIconSize.y), moneyTypes[resourceIndex].amount.ToString(), "Money");
			}
		}
		else
		{
			//Set the background of the money gui style
			GUI.skin.GetStyle("Money").normal.background = moneyIcon;
			
			//Display how much money we have
			GUI.Label( Rect( 0, Screen.height - 64, 120, 64), money.ToString(), "Money");
		}
		
		//Display the buildings in a horizontal menu
		for ( index = 0 ;  index < buildList.length ; index++ )
	    {
	   	   //Display buttons for each building with its icon, and check if we have money to build it
	   	   if ( buildList[index] )
	   	   {
		   	   if ( GUI.Button(Rect( index * buttonSize.x, 0, buttonSize.x, buttonSize.y), buildList[index].GetComponent(Building).icon) )
		   	   {
		   	       PickBuilding(index);
		   	   }
		   	   
		   	   if ( buildList[index].GetComponent(Building) && moneyTypes.length > 0 )
			   {
				   //Display all the resource cost of a building
				   for ( var resourceCostIndex:int = 0 ; resourceCostIndex < buildList[index].GetComponent(Building).moneyCosts.length ; resourceCostIndex++ )
				   {
				       //GUI.Label( Rect( index * buttonSize.x + 2, buttonSize.y - 30 + 30 * resourceCostIndex, buttonSize.x, 30), buildList[index].GetComponent(Building).moneyCosts[resourceCostIndex].cost.ToString());
				  	   //GUI.Box( Rect( index * buttonSize.x + 2, buttonSize.y + 25 * resourceCostIndex, buttonSize.x, 25), buildList[index].GetComponent(Building).moneyCosts[resourceCostIndex].cost.ToString());
				       //GUI.Box( Rect( index * buttonSize.x + resourceCostIndex * buttonSize.x * 0.5, buttonSize.y, buttonSize.x * 0.5, 25), buildList[index].GetComponent(Building).moneyCosts[resourceCostIndex].cost.ToString());
				   	   //Set the background of the money gui style
					   
					   GUI.skin.GetStyle("Resource").normal.background = buildList[index].GetComponent(Building).moneyCosts[resourceCostIndex].moneyObject.GetComponent(Money).iconSmall;
				   	 
					   GUI.skin.GetStyle("Resource").normal.textColor = buildList[index].GetComponent(Building).moneyCosts[resourceCostIndex].moneyObject.GetComponent(Money).textColor;
				   	 
				   	   GUI.Box( Rect( index * buttonSize.x, resourceCostIndex * 20, 32, 32), buildList[index].GetComponent(Building).moneyCosts[resourceCostIndex].cost.ToString(), "Resource");
					   
					   //print(buildList[index].GetComponent(Building).moneyCosts[resourceCostIndex].moneyObject.GetComponent(Money).resourceName.ToString());
			
					   //Display how much money we have
					   //GUI.Label( Rect( resourceIndex * moneyIconSize.x, Screen.height - moneyIconSize.y, moneyIconSize.x, moneyIconSize.y), moneyTypes[resourceIndex].amount.ToString(), "Money");
				   }
			   }
			   else
			   {
				   //Display the price of a building
				   GUI.Label( Rect( index * buttonSize.x + 2, buttonSize.y - 30, buttonSize.x, 30), buildList[index].GetComponent(Building).price.ToString());
		  	   }
		   	   
		   	   //Display the cooldown for each building
			   if ( cooldownCount[index] < cooldown[index] )   
			   {
			       //Display the cooldown bar based on the timer
		   	       GUI.Box( Rect(index * buttonSize.x,0,buttonSize.x,buttonSize.y - buttonSize.y * (cooldownCount[index]/cooldown[index])), "");
		   	   }
		   }
		   else
		   {
		       GUI.Box(Rect( index * buttonSize.x, 0, buttonSize.x, buttonSize.y), "");
		   }
	    }
	    
	    //Show the tooltip with the text description of the relevant building
	    if ( showTooltip == true && tooltipText != "" )    GUI.Label (Rect (Input.mousePosition.x, Screen.height - Input.mousePosition.y, 300, 300), tooltipText);
	}
	
	//If we have a selected building display its icon
	if ( currentBuild )
	{
		//If mouse controls are on, draw the icon at the mouse position
		if ( mouseControls == true )
		{
			GUI.Label( Rect( Input.mousePosition.x - 25, Screen.height - Input.mousePosition.y - 25, 50, 50), currentBuild.GetComponent(Building).icon);
		}
		else //Otherwise draw the icon at the position of the keyboard pointer
		{
			GUI.Label( Rect( Camera.main.WorldToScreenPoint(pointer.position).x - 25, Screen.height - Camera.main.WorldToScreenPoint(pointer.position).y - 25, 50, 50), currentBuild.GetComponent(Building).icon);
		}
	}
	
	//If we have an error ( trying to place a building on top of another ) display the error icon at the position of the mouse
	if ( error )
	{
		//If mouse controls are on, draw the icon at the mouse position
		if ( mouseControls == true )
		{
			GUI.Label( Rect( Input.mousePosition.x - 25, Screen.height - Input.mousePosition.y - 25, 50, 50), errorIcon);
		}
		else //Otherwise draw the icon at the position of the keyboard pointer
		{
			GUI.Label( Rect( Camera.main.WorldToScreenPoint(pointer.position).x - 25, Screen.height - Camera.main.WorldToScreenPoint(pointer.position).y - 25, 50, 50), errorIcon);
		}
		
		//GUI.Label( Rect( Input.mousePosition.x - 25, Screen.height - Input.mousePosition.y - 25, 50, 50), errorIcon);
	}
	
	if ( sellIcon )
	{
		if ( useOldUI == true )
		{
			if ( GUI.Button(Rect( index * buttonSize.x, 0, buttonSize.x, buttonSize.y), sellIcon) )
			{
				StartSell();
			}
		}
		
		if ( sell )
		{
			//If mouse controls are on, draw the icon at the mouse position
			if ( mouseControls == true )
			{
				GUI.Label( Rect( Input.mousePosition.x - 25, Screen.height - Input.mousePosition.y - 25, 50, 50), sellIcon);
			}
			else //Otherwise draw the icon at the position of the keyboard pointer
			{
				GUI.Label( Rect( Camera.main.WorldToScreenPoint(pointer.position).x - 25, Screen.height - Camera.main.WorldToScreenPoint(pointer.position).y - 25, 50, 50), sellIcon);
			}
			
			//GUI.Label( Rect( Input.mousePosition.x - 25, Screen.height - Input.mousePosition.y - 25, 50, 50), sellIcon);
		}
	}
}

//This function picks a building from the build list, after checking if the cooldown is 0, and we have enough resources to build it
function PickBuilding( buildingIndex:int )
{
	//If we have enough money, and the cooldown timer for the building is done, allow this building to be selected
	if ( cooldownCount[buildingIndex] >= cooldown[buildingIndex] )
	{
	   if ( buildList[buildingIndex].GetComponent(Building).moneyCosts.length > 0 && moneyTypes.length > 0 )
	   {
	       //A value to check if we meet all the resource costs
	       var moneyCostsCheck:int = 0;
	       
	       for ( var resourceCost in buildList[buildingIndex].GetComponent(Building).moneyCosts )
	       {
	           if ( CheckResourceList(resourceCost.moneyObject.GetComponent(Money).resourceName, resourceCost.cost, false) )
	           {
	               moneyCostsCheck++;
	           }
	       }
	       
	       if ( moneyCostsCheck == buildList[buildingIndex].GetComponent(Building).moneyCosts.length )
	       {
	           //If we already have a selected building, remove it
	           if ( currentBuild )    Destroy(currentBuild.gameObject);
	           
	           //Set the new building as the selected one, and put it offscreen
	           currentBuild = Instantiate( buildList[buildingIndex], Vector3(100,100,100), Quaternion.identity);

	           //Deactivate the main components of the building
	    	   if ( currentBuild.GetComponent(MoneyMaker) )    currentBuild.GetComponent(MoneyMaker).enabled = false;
	    	   if ( currentBuild.GetComponent(Weapon) )    currentBuild.GetComponent(Weapon).enabled = false;
	    	   if ( currentBuild.collider )    currentBuild.collider.enabled = false;
	           
	           //Set the current building index
	           currentIndex = buildingIndex;
	           
	           //If the building has a collider, remove it so we don't collide with objects in the game ( An enemy, or another object )
	           if ( currentBuild.collider )    currentBuild.collider.enabled = false;
	           
	           sell = false;
	           
	           if ( audio )    audio.Play();
	       }
	   }
	   else if ( money - buildList[buildingIndex].GetComponent(Building).price >= 0 )
	   {
	       //If we already have a selected building, remove it
	       if ( currentBuild )    Destroy(currentBuild.gameObject);
	       
	       //Set the new building as the selected one, and put it offscreen
	       currentBuild = Instantiate( buildList[buildingIndex], Vector3(100,100,100), Quaternion.identity);

	       //Deactivate the main components of the building
		   if ( currentBuild.GetComponent(MoneyMaker) )    currentBuild.GetComponent(MoneyMaker).enabled = false;
		   if ( currentBuild.GetComponent(Weapon) )    currentBuild.GetComponent(Weapon).enabled = false;
		   if ( currentBuild.collider )    currentBuild.collider.enabled = false;
	       
	       //Set the current building index
	       currentIndex = buildingIndex;
	       
	       //If the building has a collider, remove it so we don't collide with objects in the game ( An enemy, or another object )
	       if ( currentBuild.collider )    currentBuild.collider.enabled = false;
	       
	       sell = false;
	       
	       if ( audio )    audio.Play();
	   }
	}
}

//This function tries to place a building on the tiles. Some buildings require more than one tile, so you can't place them unless all the tiles they sit on are free
function PlaceBuilding()
{
	//Stop responding to navigation events ( for 4.6+ UI )
	if ( useOldUI == false )    EventSystem.current.sendNavigationEvents = false;
	
	var currentBuilding = currentBuild.GetComponent(Building);
	
	var freeTiles = new Transform[currentBuilding.buildingSize.x * currentBuilding.buildingSize.y];
	
	var tileCounter:int = 0;
	
	//Go through all the tiles that this building should sit on, and make sure they are all free
	for ( var tileIndexX:int = 0 ; tileIndexX < currentBuilding.buildingSize.x ; tileIndexX++ )
	{
		for ( var tileIndexY:int = 0 ; tileIndexY < currentBuilding.buildingSize.y ; tileIndexY++ )
		{
			//Create a raycast from the camera to the mouse position and check collision with a list of allowed tiles ( The raycast checks only the layers on the allowedTiles list )
			if ( Physics.Raycast( pointer.position + Vector3(tileIndexY,0,tileIndexX), -Vector3.up, hit, 100, currentBuilding.allowedTiles) ) 
			{
				//Allow the building to be placed only if there is no building on the tile OR if this building is stackable and the tile has no stackable object on it
				if ( hit.collider.GetComponent(Tile).building == null || (hit.collider.GetComponent(Tile).stackable == null && currentBuild.GetComponent(Building).stackable == true) )
				{
				        freeTiles[tileCounter] = hit.collider.transform;
				        
				        tileCounter++;
				}
				else //We have an error because we tried to place the selected building on an occupied tile
				{
					error = true;
					
					currentBuild.gameObject.SetActive(false);
					
					return;
				}
			}
			else
			{
				return;
			}
		}
	}
	
	//If we passed this point, then all required tiles are free, and we can place the building

	error = false; //There is no error
	        
	//Place the building on the correct tile
	currentBuild.position = freeTiles[0].position;
	currentBuild.gameObject.SetActive(true);

	//If we click the Left Mouse Button, place the building on the tile and reduce from the player's money, and activate the building
	if ( Input.GetButtonDown("Fire1") )
	{
		//Start responding to navigation events ( for 4.6+ UI )
		if ( useOldUI == false )    EventSystem.current.sendNavigationEvents = true;
		
		//Assign this building to the correct slot in the tile script whether it's a building or a stackable building
		for ( var tileCounterIndex:int = 0 ; tileCounterIndex < tileCounter ; tileCounterIndex++ )
		{
	        	if ( currentBuilding.stackable == true )
	        	{
	        		freeTiles[tileCounterIndex].GetComponent(Tile).stackable = currentBuild;
	        	}
	        	else
	        	{
	        		freeTiles[tileCounterIndex].GetComponent(Tile).building = currentBuild;
	        	}
		}
		
		if ( currentBuilding.moneyCosts.length > 0 && moneyTypes.length > 0 )
		{
			for ( var resourceCost in currentBuilding.moneyCosts )
			{
				CheckResourceList(resourceCost.moneyObject.GetComponent(Money).resourceName, resourceCost.cost, true);
			}
		}
		else
		{
			//Reduce from the player's money
			money -= currentBuilding.price;
		}
		
		//Activate the main components of the building
		if ( currentBuild.GetComponent(MoneyMaker) )    currentBuild.GetComponent(MoneyMaker).enabled = true;
		if ( currentBuild.GetComponent(Weapon) )    currentBuild.GetComponent(Weapon).enabled = true;
		if ( currentBuild.collider )    currentBuild.collider.enabled = true;
		
		//Reset the cooldown counter to 0
		cooldownCount[currentIndex] = 0;
		
		//If the building has a build animation, play it
		if ( currentBuild.animation )    currentBuild.animation.Play();
		
		//If the building has an audio, play it
		if ( currentBuild.audio )    currentBuild.audio.Play();
		
		//Reset the building selection
		currentBuild = null;
		
		if ( soundBuild )    audio.PlayOneShot(soundBuild);
	}

}

//This function goes through the build list, and deactivates all the build buttons in it
function ClearBuildList()
{
	for ( var index = 0 ; index < buildListButtons.Length ; index++ )
	{
		//Disable the icons of the building
		buildListButtons[index].Find("Icon").gameObject.SetActive(false);
		
		//Make the button of the building in the build list unclickable
		buildListButtons[index].GetComponent(Button).interactable = false;
	}
}

//This function goes through the build list, and sets the icons for the building and money types for each
function SetBuildList()
{
	var buildLimit:int = 0;
	
	//Limit the number of units that go into the final build list based on the lower number between buildListButtons.Length and buildList.Length 
	if ( buildListButtons.Length > buildList.Length )    buildLimit = buildList.Length;
	else    buildLimit = buildListButtons.Length;
	
	for ( var index = 0 ; index < buildLimit ; index++ )
	{
		if ( buildList[index] != null )
		{
			if ( buildList[index].GetComponent(Building) )
			{
				//Make the button of the building in the build list unclickable
				buildListButtons[index].GetComponent(Button).interactable = true;
				
				if ( buildListButtons[index].Find("Icon") )    
				{
					//Add the icon of the building
					buildListButtons[index].Find("Icon").GetComponent(Image).sprite = Sprite.Create(buildList[index].GetComponent(Building).icon , Rect( 0, 0,buildList[index].GetComponent(Building).icon.width, buildList[index].GetComponent(Building).icon.height), Vector2(0.5f, 0.5f));
					
					//Disable the icons of the building
					buildListButtons[index].Find("Icon").gameObject.SetActive(true);
				}
				
				//Go through all available money costs and set their icons
				for ( var moneyIndex:int = 0 ; moneyIndex < buildListButtons[index].Find("Icon").childCount ; moneyIndex++ )
				{
					if ( moneyIndex < buildList[index].GetComponent(Building).moneyCosts.Length )
					{
						//Assign the icon of the money type
					    buildListButtons[index].Find("Icon").GetChild(moneyIndex).GetComponent(Image).sprite = Sprite.Create(buildList[index].GetComponent(Building).moneyCosts[moneyIndex].moneyObject.GetComponent(Money).iconSmall , Rect( 0, 0,buildList[index].GetComponent(Building).moneyCosts[moneyIndex].moneyObject.GetComponent(Money).iconSmall.width, buildList[index].GetComponent(Building).moneyCosts[moneyIndex].moneyObject.GetComponent(Money).iconSmall.height), Vector2(0.5f, 0.5f));
					
					    //Assign the text of the cost of this money type
					    buildListButtons[index].Find("Icon").GetChild(moneyIndex).Find("Text").GetComponent(Text).text = buildList[index].GetComponent(Building).moneyCosts[moneyIndex].cost.ToString();
					}
					else
					{
						buildListButtons[index].Find("Icon").GetChild(moneyIndex).gameObject.SetActive(false);
					}
				}
			}
		}
		else
		{
			//Disable the icons of the building
			buildListButtons[index].Find("Icon").gameObject.SetActive(false);
			
			//Make the button of the building in the build list unclickable
			buildListButtons[index].GetComponent(Button).interactable = false;
		
		}
	}
	
	
}

//This function activates the sell ability. When clicking on a unit with this ability you can sell it.
function StartSell()
{
	if ( sell == true )
	{
		sell = false;
		
		//Stop responding to navigation events ( for 4.6+ UI )
		if ( useOldUI == false )    EventSystem.current.sendNavigationEvents = true;
	}
	else
	{
		sell = true;
		
		//Stop responding to navigation events ( for 4.6+ UI )
		if ( useOldUI == false )    EventSystem.current.sendNavigationEvents = false;
		
		//If we already have a selected building, remove it
	    if ( currentBuild )    Destroy(currentBuild.gameObject);
		
		//Reset the building selection
	    currentBuild = null;
	}
}

//This function draws the object spawn area in the editor
function OnDrawGizmosSelected()
{
	Gizmos.color = Color.yellow;
	
	Gizmos.DrawLine(Vector3(pointerMoveArea.y,0,pointerMoveArea.x), Vector3(pointerMoveArea.y,0,pointerMoveArea.width));
	Gizmos.DrawLine(Vector3(pointerMoveArea.y,0,pointerMoveArea.width), Vector3(pointerMoveArea.height,0,pointerMoveArea.width));
	Gizmos.DrawLine(Vector3(pointerMoveArea.height,0,pointerMoveArea.x), Vector3(pointerMoveArea.height,0,pointerMoveArea.width));
	Gizmos.DrawLine(Vector3(pointerMoveArea.height,0,pointerMoveArea.x), Vector3(pointerMoveArea.y,0,pointerMoveArea.x));
}
