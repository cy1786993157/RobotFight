using UnityEngine;
using System.Collections;

namespace MvR
{
	/// <summary>
	/// Creates a money object every few seconds.
	/// </summary>
	public class MoneyMaker : MonoBehaviour
	{
		// The money object to be created
		public Transform moneyObject;
		
		// The delay before creating money
		public float delay = 10;
		private float delayCount = 0;
		
		// The area in which this object may spawn
		public Rect spawnArea;

		// The name of the animation to be played when money is produced
		public string moneyAnimation;

		// How many seconds to wait before producing the shot from this weapon
		public float moneyAnimationTime = 0;

		// Are we creating money right now?
		private bool isCreatingMoney = false;

		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			// Count up the delay
			delayCount += Time.deltaTime;
	
			// Create a new money object
			if ( delayCount >= delay && isCreatingMoney == false )
			{
				delayCount = 0;
		
				CreateMoney(moneyAnimationTime);
		
				// Play the money animation, if available
                //if ( animation )
                //{
                //    if ( moneyAnimation == string.Empty )
                //    {
                //        if ( animation["attack"] )
                //            animation.Play("attack");
                //    }
                //    else
                //    {
                //        if ( animation[moneyAnimation] )
                //            animation.Play(moneyAnimation);
                //    }
                //}
			}
		}

		/// <summary>
		/// Draws gizmos in Unity IDE.
		/// </summary>
		public void OnDrawGizmosSelected()
		{
			Gizmos.color = Color.blue;
	
			// Draw a gizmo of the money spawn area
			Gizmos.DrawLine(transform.position + new Vector3(spawnArea.y, 0, spawnArea.x), transform.position + new Vector3(spawnArea.y, 0, spawnArea.x + spawnArea.width));
			Gizmos.DrawLine(transform.position + new Vector3(spawnArea.y, 0, spawnArea.x + spawnArea.width), transform.position + new Vector3(spawnArea.y + spawnArea.height, 0, spawnArea.x + spawnArea.width));
			Gizmos.DrawLine(transform.position + new Vector3(spawnArea.y + spawnArea.height, 0, spawnArea.x + spawnArea.width), transform.position + new Vector3(spawnArea.y + spawnArea.height, 0, spawnArea.x));
			Gizmos.DrawLine(transform.position + new Vector3(spawnArea.y, 0, spawnArea.x), transform.position + new Vector3(spawnArea.y + spawnArea.height, 0, spawnArea.x));
		}

		/// <summary>
		/// Creates money with a delay.
		/// </summary>
		/// <returns>
		/// The money.
		/// </returns>
		/// <param name='delay'>
		/// Delay.
		/// </param>
		internal void CreateMoney( float delay )
		{
			isCreatingMoney = true;

			DelayForSeconds(delay);

			if ( moneyObject )
			{
				// Create a new money object within the spawn area
				Transform newMoney = Instantiate( moneyObject, transform.position + new Vector3(spawnArea.y, 0, spawnArea.x), Quaternion.identity) as Transform;

				// Place the money at a random position within the area limit
				Vector3 newPos = new Vector3(newMoney.position.x + Random.value * spawnArea.height, newMoney.position.y, newMoney.position.z + Random.value * spawnArea.width);

				newMoney.position = newPos;
			}
	
			isCreatingMoney = false;
		}

		/// <summary>
		/// Executes WaitForSconds(delay);
		/// </summary>
		/// <returns>The for seconds.</returns>
		/// <param name="delay">Delay.</param>
		private IEnumerator DelayForSeconds(float delay)
		{
			yield return new WaitForSeconds(delay);
		}
	}
}
