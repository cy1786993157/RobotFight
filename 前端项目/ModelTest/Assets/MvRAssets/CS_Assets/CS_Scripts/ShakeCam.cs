using UnityEngine;

namespace MvR
{
	/// <summary>
	/// This script shakes an object when it runs, with values for strength and time.
	/// You can set which object to shake, and if you keep the object value empty it
	/// will shake the object it's attached to.
	/// </summary>
	public class ShakeCam : MonoBehaviour
	{
		// The original position of the camera
		private Vector3 originPos;

		// How violently to shake the camera
		public Vector3 strength;

		// How quickly to settle down from shaking
		public float decay = 0.8f;

		// How many seconds to shake
		public float _shakeTime = 2;

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			// Record the original position of the camera
			originPos = Camera.main.transform.position;
		}
	
		/// <summary>
		/// Update is called every frame, if the MonoBehaviour is enabled.
		/// </summary>
		public void Update()
		{
			if( _shakeTime > 0 )
			{
				_shakeTime -= Time.deltaTime;
		
				// Move the camera in all directions based on strength
				Camera.main.transform.position = new Vector3(originPos.x + Random.Range(-strength.x, strength.x), originPos.y + Random.Range(-strength.y, strength.y), originPos.z + Random.Range(-strength.z, strength.z));
		
				// Gradually reduce the strength value
				strength *= decay;
			}
			else if( Camera.main.transform.position != originPos )
			{
				// Reset the camera position
				Camera.main.transform.position = originPos;
			}
		}
	}
}
