/*This script holds a list of enemies and their numbers. It also holds the spawn rate and points from which they appear. The script counts the delay timer 
for each enemy type and then creates one at a random spwan point. After all enemies have spawned, a boss enemy is created. You win by killing the boss*/

#pragma strict

import UnityEngine.UI;

//@script ExecuteInEditMode

//Should we use the old Unity OnGUI instead of the new Unity (4.6+) UI
var useOldUI:boolean = false;

//The canvas for the build menu in the new UI (4.6+)
var enemyCanvas:Transform;

//Lists of enemies and their numbers
var enemies:Enemies[];

class Enemies 
{
    var enemyTypes:Transform;
    var enemyCounts:int = 0;
}

//How many seconds to wait before creating a new enemy
var spawnDelay:float = 7;
internal var spawnDelayCount:float = 0;

//The enemy boss object along with some varaibles to check its state
var enemyBoss:Transform;
private var currentBoss:Transform = null;
internal var bossState:int = 0;

//A list of the spwan points from which enemies appear
var spawnPoints:Transform[];

//The total number of enemies in the level
private var enemiesTotal:float;
private var enemiesCreated:float = 0;
internal var enemiesKilled:float= 0;

//Did we win this battle?
internal var win:boolean = false;

//The image to display when winning
var winTexture:Texture2D;

//Did we lose this battle?
internal var lose:boolean = false;

//The image to display when losing
var loseTexture:Texture2D;

//The next level to be loaded after winning
var nextLevel:String = "Level3";

//Various sounds
var soundDefeat:AudioClip;
var soundVictory:AudioClip;

//Is the battle over? 
internal var battleIsOver:boolean = false;

//General use index
private var index:int = 0;

//The star rating for this level
private var starRating:float = 0;

//The maximum possible star rating for this level
var maxStarRatings:int = 6;

//How many Last Line of Defense objects are in the level
internal var LLODAvailable:float = 0;

//How many Last Line of Defense objects are left
internal var LLODLeft:float = 0;

//The image to display for a star and empty star rating
var starIcon:Texture2D;
var starEmptyIcon:Texture2D;

function Start() 
{
	//If we are using the old GUI, deactivate the new UI canvas 
	if ( useOldUI == true )    
	{
		//If we have an enemy canvas assigned, deactivate it
		if ( GetComponent(EnemyDispenser).enemyCanvas )    GetComponent(EnemyDispenser).enemyCanvas.gameObject.SetActive(false);
	}
	
	//Go through all the enemy types, reset their delays and add them to the total enemies count
	for ( var enemyIndex:int = 0 ; enemyIndex < enemies.Length ; enemyIndex++ )
	{
		//Add to total enemies
		enemiesTotal += enemies[enemyIndex].enemyCounts;
	}
	
	//If we have a boss, count it too
	if ( enemyBoss )    enemiesTotal++;
	
	//Check how many Last Line of Defense objects are available
	for ( LLOD in GameObject.FindGameObjectsWithTag("LLOD") )
	{
		LLODAvailable++;
	}
}

function Update() 
{
	//If we are using the new GUI (4.6+), update it while the game runs
	if ( useOldUI == false )    
	{
		if ( GetComponent(EnemyDispenser).enemyCanvas )
		{
			//Display how many enemies are left to be spawned
			GetComponent(EnemyDispenser).enemyCanvas.Find("Image/Fill").GetComponent(RectTransform).sizeDelta.x =  GetComponent(EnemyDispenser).enemyCanvas.Find("Image").GetComponent(RectTransform).sizeDelta.x * (1 - enemiesCreated/enemiesTotal);
			GetComponent(EnemyDispenser).enemyCanvas.Find("Image/Text").GetComponent(Text).text = (enemiesTotal - enemiesCreated).ToString() + "/" + enemiesTotal.ToString();
		}
	}
	
	//Count up the spawn delay
	spawnDelayCount += Time.deltaTime;
	
	if ( spawnDelayCount >= spawnDelay )
	{
		//Go through each enemy type and create an enemy at a random spawn point
		if ( index < enemies.Length )
		{
			//If we still have enemies of this type, proceed
			if ( enemies[index].enemyCounts > 0 )
			{
				//enemies[enemyIndex].enemyDelaysCount = 0;
				spawnDelayCount = 0;
				
				//Count down the enemy amount
				enemies[index].enemyCounts--;
				
				//Count up the number of enemies created
				enemiesCreated++;
				
				//Choose a random spawn point from the list
				var spawnIndex:int = Random.Range(0, spawnPoints.Length);
				
				//Create the enemy at the chosen spawn point
				var _newEnemy:Transform = Instantiate( enemies[index].enemyTypes, spawnPoints[spawnIndex].position, spawnPoints[spawnIndex].rotation );
				
				//Scale objects for 2D presentation
				_newEnemy.eulerAngles.z = 180;
				_newEnemy.localScale.y *= -1;
				
				//Set the lane of this enemy
				_newEnemy.GetComponent(Enemy).lane = spawnPoints[spawnIndex];
			}
			
			index++;
		}
		else
		{
			index = 0;
		}
	}
	
	if ( battleIsOver == false )
	{
		//If we have an enemy boss set, create it
		if ( enemyBoss )
		{
			if ( enemiesCreated >= enemiesTotal - 1 )
			{
				if ( bossState == 0 )
				{
					bossState = 1; //Set boss state to "created"
			
					//Create a boss enemy and place it in the middle spwan point
					currentBoss = Instantiate( enemyBoss, spawnPoints[Mathf.Floor(spawnPoints.Length * 0.5)].position, spawnPoints[spawnIndex].rotation );
					
					//Scale objects for 2D presentation
					currentBoss.eulerAngles.z = 180;
					currentBoss.localScale.y *= -1;
					
					//Set the lane of this enemy
					currentBoss.GetComponent(Enemy).lane = spawnPoints[spawnIndex];
				}
			}
			
			//If all created enemies were killed and we don't have a boss, then we win
			if ( enemiesKilled >= enemiesTotal && currentBoss == null ) 
			{
				Win();
			}
		}
		else if ( enemiesKilled >= enemiesTotal ) //If all created enemies were killed and we don't have a boss, then we win
		{
			Win();
		}
	}
}

function Win()
{
	//Battle is over
	battleIsOver = true;
	
	yield WaitForSeconds(1);
	
	//Play vistory sound
	if ( soundVictory )    audio.PlayOneShot(soundVictory);
	
	win = true;
	
	//Check how many Last Line of Defense objects are left and set the star rating based on that
	for ( LLOD in GameObject.FindGameObjectsWithTag("LLOD") )
	{
		LLODLeft++;
	}
	
	starRating = Mathf.Floor((LLODLeft/LLODAvailable) * maxStarRatings) + 1;

	//Set the rating of the current level in PlayerPrefs, but only if it's higher than the previous rating
	if ( starRating > PlayerPrefs.GetInt(Application.loadedLevelName) )
	{
		PlayerPrefs.SetInt(Application.loadedLevelName, starRating );
	}
	
	yield WaitForSeconds(4);
	
	//Unlock the next level and go to it
	PlayerPrefs.SetInt(nextLevel, 1);
	
	//If a next level is set, load it
	if ( nextLevel == "" )    
	{
		Debug.LogWarning("Warning, no level name was set");
	}
	else
	{
		Application.LoadLevel(nextLevel);
	}
	
}

function Lose()
{
	//Battle is over
	battleIsOver = true;
	
	yield WaitForSeconds(1);
	
	//Play defeat sound
	if ( soundDefeat )    audio.PlayOneShot(soundDefeat);
	
	lose = true;
	
	yield WaitForSeconds(3);
	
	//Load the start menu
	Application.LoadLevel("StartMenu");
}

//The following code displays a simple graphic when winning or losing. This GUI element is very primitive  and is not recommended for your full project.
//Instead you should consider using a more robust and advanced GUI system than what is available natively in Unity (21/8/2013) such as EZGUI or NGUI.

var guiSkin:GUISkin;

function OnGUI()
{
	GUI.skin = guiSkin;
	
	if ( useOldUI == true )
	{
		//Display how many enemies are left to be spawned
		if ( enemiesCreated < enemiesTotal )    GUI.Box( Rect( Screen.width - 200, Screen.height - 32, 200 * (1 - enemiesCreated/enemiesTotal), 30), "");
		GUI.Box( Rect( Screen.width - 200, Screen.height - 32, 200, 30), (enemiesTotal - enemiesCreated).ToString() + "/" + enemiesTotal.ToString());
	}
	
	//Display win image
	if ( win )    
	{
		if ( winTexture )
		{
			GUI.Label( Rect( (Screen.width - winTexture.width) * 0.5, (Screen.height - winTexture.height) * 0.5, winTexture.width, winTexture.height), winTexture);
		}
		
		for ( index = 0 ; index < maxStarRatings ; index++ )
		{
			if ( index < starRating - 1 )
			{
				if ( starIcon )
				{
					GUI.Label( Rect( (Screen.width - starIcon.width * maxStarRatings) * 0.5 + starIcon.width * index, (Screen.height + starIcon.height) * 0.5, starIcon.width, starIcon.height), starIcon);
				}
			}
			else
			{
				if ( starEmptyIcon )
				{
					GUI.Label( Rect( (Screen.width - starEmptyIcon.width * maxStarRatings) * 0.5 + starEmptyIcon.width * index, (Screen.height + starEmptyIcon.height) * 0.5, starEmptyIcon.width, starEmptyIcon.height), starEmptyIcon);
				}
			}
		}
	}
	
	//Display lose image
	if ( lose )    
	{
		if ( loseTexture )
		{
			GUI.Label( Rect( (Screen.width - loseTexture.width) * 0.5, (Screen.height - loseTexture.height) * 0.5, loseTexture.width, loseTexture.height), loseTexture);
		}
	}
}


