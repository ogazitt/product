namespace BuiltSteady.Product.ServiceHost
{
    public interface IWorker
    {
        void Start();
        int Timeout { get; }  // timeout in ms
    }
}
