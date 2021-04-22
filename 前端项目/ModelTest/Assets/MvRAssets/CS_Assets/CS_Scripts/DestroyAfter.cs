using UnityEngine;

namespace MvR
{
	/// <summary>
	/// This script destroys an object after some time.
	/// This is mainly used to destroy Shuriken particle systems which, for some wierd reason have no built in "one shot"
	/// function, like the old Unity partcile system had.
	/// </summary>
	public class DestroyAfter : MonoBehaviour
	{
		public float destroyAfter = 5;

		/// <summary>
		/// Start is only called once in the lifetime of the behaviour.
		/// The difference between Awake and Start is that Start is only called if the script instance is enabled.
		/// This allows you to delay any initialization code, until it is really needed.
		/// Awake is always called before any Start functions.
		/// This allows you to order initialization of scripts
		/// </summary>
		public void Start()
		{
			Destroy(gameObject, destroyAfter);
		}
	}
}