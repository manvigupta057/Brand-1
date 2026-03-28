import Card from "components/card";

const Widget = ({ icon, title, subtitle }) => {
  return (
    <Card extra="!flex-row flex-grow items-center rounded-[20px] p-4 bg-white shadow-sm border border-gray-100">
      <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
        <div className="rounded-full bg-blue-50 p-3">
          <span className="flex items-center text-blue-500">
            {icon}
          </span>
        </div>
      </div>

      <div className="ml-4 flex w-auto flex-col justify-center">
        <p 
          className="font-dm text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: '#718096', opacity: 1, display: 'block' }} // Slate Gray for Title
        >
          {title}
        </p>
        <h4 
          className="text-2xl font-black" 
          style={{ color: '#000000', opacity: 1, display: 'block' }} // FORCE Pure Black for Subtitle
        >
          {subtitle !== undefined ? subtitle : "---"}
        </h4>
      </div>
    </Card>
  );
};

export default Widget;
