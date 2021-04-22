using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using MvR.Types;

namespace MvR
{
	/// <summary>
	/// This script holds a list of enemies and their numbers. It also holds the spawn rate and points from which they appear.
	/// The script counts the delay timer for each enemy type and then creates one at a random spwan point.
	/// After all enemies have spawned, a boss enemy is created. You win by killing the boss.
	/// </summary>
	public class EnemyDispenser : MonoBehaviour
	{
		// Should we use the old Unity OnGUI instead of the new Unity (4.6+) UI
		public bool useOldUI = false;
		
		// The canvas for the build menu in the new UI (4.6+)
		public Transform enemyCanvas;

		// Array of enemies and their numbers.
		public Enemies[] enemies; 

		// How many seconds to wait before creating a new enemy
		public float spawnDelay = 7;
		internal float spawnDelayCount = 0;

		// The enemy boss object along with some varaibles to check its state
		public Transform enemyBoss;
		private Transform currentBoss = null;
		internal int bossState = 0;

		// A list of the spwan points from which enemies appear
		public Transform[] spawnPoints;

		// The total number of enemies in the level
		private float enemiesTotal;
		private float enemiesCreated = 0;
		internal float enemiesKilled = 0;

		// Did we win this battle?
		internal bool win = false;

		// The image to display when winning
		public Texture2D winTexture;

		// Did we lose this battle?
		internal bool lose = false;

		// The image to display when losing
		public Texture2D loseTexture;

		// The next level to be loaded after winning
		public string nextLevel = "Level3";

		// Various sounds
		public AudioClip soundDefeat;
		public AudioClip soundVictory;

		// Is the battle over?
		internal bool battleIsOver = false;

		// General use index
		private int index = 0;

		// The star rating for this level
		private float starRating = 0;

		// The maximum possible star rating for this level
		public int maxStarRatings = 6;

		// How many Last Line of Defense objects are in the level
		internal float LLODAvailable = 0;

		// How many Last Line of Defense objects are left
		internal float LLODLeft = 0;

		// The image to display for a star and empty star rating
		public Texture2D starIcon;
		public Texture2D starEmptyIcon;
		public GUISkin guiSkin;

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			// If we are using the old GUI, deactivate the new UI canvas 
			if ( useOldUI == true )    
			{
				EnemyDispenser ed = GetComponent<EnemyDispenser>();
				// If we have an enemy canvas assigned, deactivate it
				if ( ed.enemyCanvas )
					ed.enemyCanvas.gameObject.SetActive(false);
			}

			// Go through all the enemy types, reset their delays and add them to the total enemies count
			for( int enemyIndex = 0; enemyIndex < enemies.Length; enemyIndex++ )
			{
				// Add to total enemies
				enemiesTotal += enemies[enemyIndex].enemyCounts;
			}

			// If we have a boss, count it too
			if( enemyBoss )
				enemiesTotal++;

			// Check how many Last Line of Defense objects are available
			LLODAvailable = GameObject.FindGameObjectsWithTag("LLOD").Length;
		}

		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			//If we are using the new GUI (4.6+), update it while the game runs
			if ( useOldUI == false )    
			{
				EnemyDispenser ed = GetComponent<EnemyDispenser>();

				if ( ed.enemyCanvas )
				{
					// Display how many enemies are left to be spawned
					Vector2 deltaSize = new Vector2(ed.enemyCanvas.Find("Image").GetComponent<RectTransform>().sizeDelta.x * (1 - enemiesCreated/enemiesTotal), ed.enemyCanvas.Find("Image").GetComponent<RectTransform>().sizeDelta.y);

					ed.enemyCanvas.Find("Image/Fill").GetComponent<RectTransform>().sizeDelta = deltaSize;
					ed.enemyCanvas.Find("Image/Text").GetComponent<Text>().text = (enemiesTotal - enemiesCreated).ToString() + "/" + enemiesTotal.ToString();
				}
			}

			// Count up the spawn delay
			spawnDelayCount += Time.deltaTime;

			// Choose a random spawn point from the list
			int spawnIndex = Random.Range(0, spawnPoints.Length);

			if( spawnDelayCount >= spawnDelay )
			{
				// Go through each enemy type and create an enemy at a random spawn point
				if( index < enemies.Length )
				{
					// If we still have enemies of this type, proceed
					if( enemies[index].enemyCounts > 0 )
					{
						// enemies[enemyIndex].enemyDelaysCount = 0;
						spawnDelayCount = 0;

						// Count down the enemy amount
						enemies[index].enemyCounts--;

						// Count up the number of enemies created
						enemiesCreated++;

						// Create the enemy at the chosen spawn point
						Transform _newEnemy = (Transform)Instantiate(enemies[index].enemyTypes, spawnPoints[spawnIndex].position, spawnPoints[spawnIndex].rotation);
				
						// Scale objects for 2D presentation
						_newEnemy.eulerAngles = new Vector3(_newEnemy.eulerAngles.x, _newEnemy.eulerAngles.y, 180);
						_newEnemy.localScale = new Vector3(_newEnemy.localScale.x, _newEnemy.localScale.y * -1, _newEnemy.localScale.z);

						// Set the lane of this enemy
						Enemy e = _newEnemy.GetComponent<Enemy>();

						if (e)
						{
							e.lane = spawnPoints[spawnIndex];
						}
						//_newEnemy.GetComponent<Enemy>().lane = spawnPoints[spawnIndex];
					}
			
					index++;
				}
				else
				{
					index = 0;
				}
			}
	
			if( battleIsOver == false )
			{
				// If we have an enemy boss set, create it
				if( enemyBoss != null )
				{
					if( enemiesCreated >= enemiesTotal - 1 )
					{
						if( bossState == 0 )
						{
							bossState = 1; // Set boss state to "created"
			
							// Create a boss enemy and place it in the middle spwan point
							currentBoss = (Transform)Instantiate(enemyBoss, spawnPoints[(int)Mathf.Floor(spawnPoints.Length * 0.5f)].position, spawnPoints[spawnIndex].rotation);
					
							// Scale objects for 2D presentation
							currentBoss.eulerAngles = new Vector3(currentBoss.eulerAngles.x, currentBoss.eulerAngles.y, 180);
							currentBoss.localScale = new Vector3(currentBoss.localScale.x, currentBoss.localScale.y * -1, currentBoss.localScale.z);

							// Set the lane of this enemy
							currentBoss.GetComponent<Enemy>().lane = spawnPoints[spawnIndex];
						}
					}
			
					// If all created enemies were killed and we don't have a boss, then we win
					if( enemiesKilled >= enemiesTotal && currentBoss == null )
					{
						Win();
					}
				}
				else if( enemiesKilled >= enemiesTotal ) // If all created enemies were killed and we don't have a boss, then we win
				{
					Win();
				}
			}
		}

		/// <summary>
		/// OnGUI is called for rendering and handling GUI events.
		/// This means that your OnGUI implementation might be called several times per frame (one call per event).
		/// For more information on GUI events see the Event reference. If the MonoBehaviour's enabled property is
		/// set to false, OnGUI() will not be called.
		/// </summary>
		public void OnGUI()
		{
			GUI.skin = guiSkin;
	
			if ( useOldUI == true )
			{
				//Display how many enemies are left to be spawned
				if ( enemiesCreated < enemiesTotal )  
					GUI.Box( new Rect( Screen.width - 200, Screen.height - 32, 200 * (1 - enemiesCreated/enemiesTotal), 30), string.Empty);

				GUI.Box( new Rect( Screen.width - 200, Screen.height - 32, 200, 30), (enemiesTotal - enemiesCreated).ToString() + "/" + enemiesTotal.ToString());
			}

			// Display win image
			if( win )
			{
				if( winTexture != null )
				{
					GUI.Label(new Rect((Screen.width - winTexture.width) * 0.5f, (Screen.height - winTexture.height) * 0.5f, winTexture.width, winTexture.height), winTexture);
				}

				for( index = 0; index < maxStarRatings; index++ )
				{
					if( index < starRating - 1 )
					{
						if( starIcon != null )
						{
							GUI.Label(new Rect((Screen.width - starIcon.width * maxStarRatings) * 0.5f + starIcon.width * index, (Screen.height + starIcon.height) * 0.5f, starIcon.width, starIcon.height), starIcon);
						}
					}
					else
					{
						if( starEmptyIcon != null )
						{
							GUI.Label(new Rect((Screen.width - starEmptyIcon.width * maxStarRatings) * 0.5f + starEmptyIcon.width * index, (Screen.height + starEmptyIcon.height) * 0.5f, starEmptyIcon.width, starEmptyIcon.height), starEmptyIcon);
						}
					}
				}
			}
	
			// Display lose image
			if( lose )
			{
				if( loseTexture != null )
				{
					GUI.Label(new Rect((Screen.width - loseTexture.width) * 0.5f, (Screen.height - loseTexture.height) * 0.5f, loseTexture.width, loseTexture.height), loseTexture);
				}
			}
		}

		/// <summary>
		/// Win condition.
		/// </summary>
		internal void Win()
		{
			StartCoroutine(ExecuteWin());
		}

		/// <summary>
		/// Executes the win condition, along with time delays
		/// </summary>
		internal IEnumerator ExecuteWin()
		{
			// Battle is over
			battleIsOver = true;
			
			yield return new WaitForSeconds(1);
			
			// Play vistory sound
			if( soundVictory )
                GetComponent<AudioSource>().PlayOneShot(soundVictory);
			
			win = true;
			
			// Check how many Last Line of Defense objects are left and set the star rating based on that
			LLODLeft = GameObject.FindGameObjectsWithTag("LLOD").Length;
			
			starRating = Mathf.Floor((LLODLeft / LLODAvailable) * maxStarRatings) + 1;

			// Set the rating of the current level in PlayerPrefs, but only if it's higher than the previous rating
			if( starRating > PlayerPrefs.GetInt(Application.loadedLevelName) )
			{
				PlayerPrefs.SetInt(Application.loadedLevelName, (int)starRating);
			}
			
			yield return new WaitForSeconds(4);
			
			// Unlock the next level and go to it
			PlayerPrefs.SetInt(nextLevel, 1);
			
			// If a next level is set, load it
			if( nextLevel == "" )
			{
				Debug.LogWarning("Warning, no level name was set");
			}
			else
			{
				Application.LoadLevel(nextLevel);
			}
		}

		/// <summary>
		/// Lose condition.
		/// </summary>
		internal void Lose()
		{
			StartCoroutine(ExecuteLose());
		}

		/// <summary>
		/// Executes the lose condition, along with time delays
		/// </summary>
		internal IEnumerator ExecuteLose()
		{
			// Battle is over
			battleIsOver = true;
			
			yield return new WaitForSeconds(1);
			
			// Play defeat sound
			if( soundDefeat )
                GetComponent<AudioSource>().PlayOneShot(soundDefeat);
			
			lose = true;
			
			yield return new WaitForSeconds(3);
			
			// Load the start menu
			Application.LoadLevel("CSStartMenu");
		}
	}
}
