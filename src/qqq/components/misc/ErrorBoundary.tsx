/*
 * QQQ - Low-code Application Framework for Engineers.
 * Copyright (C) 2021-2024.  Kingsrook, LLC
 * 651 N Broad St Ste 205 # 6917 | Middletown DE 19709 | United States
 * contact@kingsrook.com
 * https://github.com/Kingsrook/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {Component, ErrorInfo} from "react";

interface Props
{
   errorElement?: React.ReactNode;
   children: React.ReactNode;
}

interface State
{
   hasError: boolean;
}

/*******************************************************************************
 ** Component that you can wrap around other components that might throw an error,
 ** to give some isolation, rather than breaking a whole page.
 ** Credit: https://medium.com/@bobjunior542/how-to-use-error-boundaries-in-react-js-with-typescript-ee90ec814bf1
 *******************************************************************************/
class ErrorBoundary extends Component<Props, State>
{
   /***************************************************************************
    *
    ***************************************************************************/
   constructor(props: Props)
   {
      super(props);
      this.state = {hasError: false};
   }

   /***************************************************************************
    *
    ***************************************************************************/
   componentDidCatch(error: Error, errorInfo: ErrorInfo)
   {
      console.error("ErrorBoundary caught an error: ", error, errorInfo);
      this.setState({hasError: true});
   }

   /***************************************************************************
    *
    ***************************************************************************/
   render()
   {
      if (this.state.hasError)
      {
         return this.props.errorElement ?? <span>(Error)</span>;
      }

      return this.props.children;
   }
}

export default ErrorBoundary;