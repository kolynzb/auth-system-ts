const filterObj = (obj: any, ...allowedFields: any[]): any => {
  let newObj: any;
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export default filterObj;
